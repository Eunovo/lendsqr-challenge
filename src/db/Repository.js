const { knex } = require("./knex");
const { excludeFields } = require("../utils/objects");

class KnexRepository {
    constructor(table) {
        this.table = knex(table);
    }

    create(data) {
        return this.table.insert(
            excludeFields(data, ['created_at', 'updated_at']));
    }

    update(data, filter) {

    }
}

module.exports = { KnexRepository };
