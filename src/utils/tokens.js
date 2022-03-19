const jwt = require("jsonwebtoken");

const ONE_MONTH = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

module.exports.createToken = (data, expInSecsFromEpoch = ONE_MONTH) => {
    if (!process.env.JWT_SECRET)
        throw new Error("Cannot create token! No Secret");
    return jwt.sign({ exp: expInSecsFromEpoch, data }, process.env.JWT_SECRET);
}

module.exports.extractDataFromToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET).data;
}
