const { Router } = require("express");
const { KnexRepository } = require("./db/Repository");
const { createToken, extractDataFromToken } = require("./utils/tokens");

const users = new KnexRepository('users');
const accounts = new KnexRepository('accounts');

const router = Router();


router.post('/users', async (req, res) => {
    try {
        const [id] = await users.create(req.body);
        const token = createToken(id);

        res.json({
            message: 'success',
            token
        });
    } catch (error) {
        res.status(400).json({ message: 'Bad Input' });
    }
});

router.post('/accounts/fund', (req, res) => {

});

router.post('/accounts/transfer', (req, res) => {

});

router.post('/accounts/withdraw', (req, res) => {

});

module.exports = { router };
