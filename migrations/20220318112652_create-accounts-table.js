/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('accounts', function (table) {
        table.increments('account_id');
        table.integer('user_id').unsigned()
        table.foreign('user_id').references('users.user_id').onDelete('cascade');
        table.decimal('balance').notNullable().defaultTo(0.0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('accounts');
};
