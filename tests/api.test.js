const request = require("supertest");
const { app } = require("../src/app");
const { knex } = require("../src/db/knex");

beforeAll(async () => {
    await knex.migrate.latest();
});

afterEach(async () => {
    await Promise.all(
        ['users', 'accounts'].map((table) => knex(table).where(true).del())
    );
});

it('should create the user account when all required fields are provided', async function () {
    const finalUserObj = {
        email: 'novo@email.com',
        firstName: 'Novo',
        lastName: 'Novo',
    };
    const incompleteUsers = [];

    Object.keys(finalUserObj).reduce((user, key) => {
        incompleteUsers.push(user);
        return { ...user, [key]: finalUserObj[key] };
    }, {});

    for (const i in incompleteUsers) {
        const user = incompleteUsers[i];
        await request(app)
            .post('/users/')
            .send(user)
            .expect(400);
    }

    const response = await request(app)
        .post('/users/')
        .send(finalUserObj)
        .expect(200);
    expect(response.body.token).toBeDefined();
});

describe("Account funding tests", () => {
    it('should allow the user fund all owned accounts', async function () {
        let response = await makeUser('Novo');
        const token = response.body.token;

        response = await request(app)
            .get('/accounts')
            .set('Authorization', [`bearer ${token}`])
            .expect(200);
        const accounts = response.body.accounts;
        const amount = 500;

        for (const i in accounts) {
            await makePostReq(
                '/accounts/fund',
                { account_id: accounts[i].account_id, amount },
                token
            ).expect(200);
        }

        response = await request(app)
            .get('/accounts')
            .set('Authorization', [`bearer ${token}`])
            .expect(200);

        for (const i in accounts) {
            const previousBal = accounts[i].balance;
            const currentBal = response.body.accounts[i].balance;
            expect(currentBal).toEqual(previousBal + amount);
        }
    });

    it('should not allow users to fund accounts not owned by them', async function () {
        let response = await makeUser('Novo');
        const novoToken = response.body.token;
        response = await makeUser('Bob');
        const bobToken = response.body.token;

        await request(app)
            .get('/accounts')
            .expect(403);

        response = await request(app)
            .get('/accounts')
            .set('Authorization', [`bearer ${novoToken}`])
            .expect(200);

        // Novo's accounts
        const accounts = response.body.accounts;
        for (const i in accounts) {
            await makePostReq(
                '/accounts/fund',
                { account_id: accounts[i].account_id, amount: 100 },
                bobToken
            ).expect(400);
        }
    });
});

describe("Account withdrawal tests", () => {
    it('should allow the user withdraw from all owned accounts', async function () {
        let response = await makeUser('Novo');
        const token = response.body.token;

        response = await request(app)
            .get('/accounts')
            .set('Authorization', [`bearer ${token}`])
            .expect(200);
        const accounts = response.body.accounts;
        const amount = 500;

        for (const i in accounts) {
            await makePostReq(
                '/accounts/fund',
                { account_id: accounts[i].account_id, amount },
                token
            );

            await makePostReq(
                '/accounts/withdraw',
                { account_id: accounts[i].account_id, amount },
                token
            ).expect(200);
        }

        response = await request(app)
            .get('/accounts')
            .set('Authorization', [`bearer ${token}`])
            .expect(200);

        for (const i in accounts) {
            const currentBal = response.body.accounts[i].balance;
            expect(currentBal).toEqual(0);
        }
    });

    it('should not allow users to withdraw from accounts not owned by them', async function () {
        let response = await makeUser('Novo');
        const novoToken = response.body.token;
        response = await makeUser('Bob');
        const bobToken = response.body.token;

        await request(app)
            .get('/accounts')
            .expect(403);

        response = await request(app)
            .get('/accounts')
            .set('Authorization', [`bearer ${novoToken}`])
            .expect(200);

        // Novo's accounts
        const accounts = response.body.accounts;
        for (const i in accounts) {
            await makePostReq(
                '/accounts/withdraw',
                { account_id: accounts[i].account_id, amount: 0 },
                bobToken
            ).expect(400);
        }
    });
});

describe("Account transfer tests", () => {
    it('should allow inter-account transfer between accounts', async function () {
        let response = await makeUser('Novo');
        const novoToken = response.body.token;
        response = await makeUser('Bob');
        const bobToken = response.body.token;

        const getAccounts = async (tokens) => (
            (await Promise.all(
                tokens.map((token) => (
                    request(app)
                        .get('/accounts')
                        .set('Authorization', [`bearer ${token}`])
                ))
            )).map(res => res.body.accounts)
        );

        let [novoAccounts, bobAccounts] = await getAccounts([novoToken, bobToken]);

        const amount = 500;
        for (const i in novoAccounts) {
            const account = novoAccounts[i];

            await makePostReq(
                '/accounts/fund',
                { account_id: account.account_id, amount },
                novoToken
            );

            await makePostReq(
                '/accounts/transfer',
                {
                    sender_id: account.account_id,
                    receiver_id: bobAccounts[i].account_id,
                    amount
                },
                novoToken
            ).expect(200);
        }

        [novoAccounts, bobAccounts] = await getAccounts([novoToken, bobToken]);

        for (const i in novoAccounts) {
            const senderBal = novoAccounts[i].balance;
            const receiverBal = bobAccounts[i].balance;
            expect(senderBal).toEqual(0);
            expect(receiverBal).toEqual(amount);
        }
    });

    it('should not allow users transfer from accounts not owned by them', async function () {
        let response = await makeUser('Novo');
        const novoToken = response.body.token;
        response = await makeUser('Bob');
        const bobToken = response.body.token;

        let [novoAccounts, bobAccounts] = (await Promise.all(
            [novoToken, bobToken].map((token) => (
                request(app)
                    .get('/accounts')
                    .set('Authorization', [`bearer ${token}`])
            ))
        )).map(res => res.body.accounts);

        const amount = 0;
        for (const i in novoAccounts) {
            // Bob tries to transfer from Novo's account to his own
            // This transfer should not be successful
            await makePostReq(
                '/accounts/transfer',
                {
                    sender_id: novoAccounts[i].account_id,
                    receiver_id: bobAccounts[i].account_id,
                    amount
                },
                bobToken
            ).expect(400);
        }
    });
});


const makeUser = (name) => request(app).post('/users')
    .send({ email: `${name}@gmail.com`, firstName: name, lastName: name });

const makePostReq = (route, data, token) => {
    const req = request(app)
        .post(route);

    if (token) {
        req.set('Authorization', [`bearer ${token}`]);
    }

    return req.send(data);
}
