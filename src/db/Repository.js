const { knex } = require("./knex");
const { excludeFields } = require("../utils/objects");

class KnexRepository {
    constructor(table) {
        this.table = table;
    }

    create(data) {
        return knex(this.table).insert(
            excludeFields(data, ['created_at', 'updated_at']));
    }

    find(filter = {}) {
        return knex(this.table).where(filter).select();
    }

    update(data, filter) {
        return knex(this.table).where(filter).update(data);
    }
}

module.exports = { KnexRepository };
