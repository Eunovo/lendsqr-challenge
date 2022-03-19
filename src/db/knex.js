const knex = require ("knex");
const dbConfigs = require("../../knexfile");


function setupDB(config) {
    const database = knex(config);
    return database;
}

/**
* @type {Knex}
*/
module.exports.knex = setupDB(dbConfigs[process.env.NODE_ENV || 'development']);
