const express = require("express");
const bodyParser = require('body-parser')
const { config } = require("dotenv");
config();

const { router } = require("./routes");


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);

module.exports = { app };
