const { Router } = require("express");
const { knex } = require("./db/knex");
const { KnexRepository } = require("./db/Repository");
const { requireAuth } = require("./middleware/auth");
const { createToken } = require("./utils/tokens");

const users = new KnexRepository('users');
const accounts = new KnexRepository('accounts');

const router = Router();


router.post('/users', async (req, res) => {
    try {
        await knex.transaction(async trx => {
            const [id] = await users.create(req.body).transacting(trx);
            await accounts.create({ user_id: id }).transacting(trx);
            const token = createToken(id);

            res.json({
                message: 'success',
                token
            });
        });
    } catch (error) {
        res.status(400).json({ message: 'Bad Input' });
    }
});

router.get('/accounts', requireAuth, async (req, res) => {
    const results = await accounts.find({ user_id: req.user.user_id });
    res.json({
        message: 'success',
        accounts: results
    });
});

router.post('/accounts/fund', requireAuth, async (req, res) => {
    try {
        const { account_id, amount } = req.body;
        await knex.transaction(async trx => {
            const [account] = await accounts.find({ account_id, user_id: req.user.user_id })
                .transacting(trx);
            if (!account) throw new Error("Account not found");

            await accounts.update(
                { account_id, balance: account.balance + amount },
                { account_id }).transacting(trx);

            res.json({ message: 'success' });
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/accounts/transfer', requireAuth, async (req, res) => {
    try {
        const { sender_id, receiver_id, amount } = req.body;
        await knex.transaction(async trx => {
            const [sender] = await accounts.find({ account_id: sender_id, user_id: req.user.user_id })
                .transacting(trx);
            const [receiver] = await accounts.find({ account_id: receiver_id })
                .transacting(trx);

            if (!sender) throw new Error("Sender not found");
            if (sender.balance < amount) throw new Error("Insufficient balance");
            if (!receiver) throw new Error("Receiver not found");

            await accounts.update(
                { account_id: sender_id, balance: sender.balance - amount },
                { account_id: sender_id }).transacting(trx);

            await accounts.update(
                { account_id: receiver_id, balance: receiver.balance + amount },
                { account_id: receiver_id }).transacting(trx);

            res.json({ message: 'success' });
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/accounts/withdraw', requireAuth, async (req, res) => {
    try {
        const { account_id, amount } = req.body;
        await knex.transaction(async trx => {
            const [account] = await accounts.find({ account_id, user_id: req.user.user_id })
                .transacting(trx);
            if (!account) throw new Error("Account not found");
            if (account.balance < amount) throw new Error("Insufficient balance");

            await accounts.update(
                { account_id, balance: account.balance - amount },
                { account_id }).transacting(trx);

            res.json({ message: 'success' });
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.use((err, req, res, next) => {
    console.log(err);
    res.status(500)
        .json({
            message: 'Error'
        });
})

module.exports = { router };
