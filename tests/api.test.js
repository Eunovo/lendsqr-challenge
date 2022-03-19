const request = require("supertest");
const { app } = require("../src/app");
const { knex } = require("../src/db/knex");

beforeAll(async () => {
    await knex.migrate.latest();
});

afterAll(async () => {
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

    await request(app)
        .post('/users/')
        .send(finalUserObj)
        .expect(200);
});

it.skip('should allow the user perform fund and withdraw operation on the account', function (done) {
    request(app)
        .post('/user')
        .expect(200, done);
});

it.skip('should only allow the authenticated account owner to fund the account', function (done) {
    request(app)
        .post('/user')
        .expect(200, done);
});


it.skip('should allow inter-account transfer between existing accounts', function (done) {
    request(app)
        .post('/user')
        .expect(200, done);
});
