"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    return knex.schema.createTable("game", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
        table.string("name").notNullable();
        table.string("author");
        table.text("description");
        table.json("custom_data");
    });
}
exports.up = up;
async function down(knex) {
    return knex.schema.dropTable("game");
}
exports.down = down;
//# sourceMappingURL=20210105172957_init.js.map