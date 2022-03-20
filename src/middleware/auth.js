const { extractDataFromToken } = require("../utils/tokens");

module.exports.requireAuth = (req, res, next) => {
    const bearerToken = req.get('authorization');
    if (!bearerToken) {
        res.status(403).json({ message: 'Unauthorised' });
        return;
    }

    const [_, token] = bearerToken.split(' ');
    if (!token) {
        res.status(403).json({ message: 'Invalid bearer token' });
        return;
    }

    const data = extractDataFromToken(token);
    if (!data) {
        res.status(403).json({ message: 'Invalid bearer token' });
        return;
    }

    req.user = { user_id: data };
    next();
}
