import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("game", (table) => {
    table.uuid("id").primary().defaultTo("uuid_generate_v4()");
    table.string("name").notNullable();
    table.string("author");
    table.text("description");
    table.json("custom_data");
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("game");
}

