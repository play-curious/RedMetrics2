import * as Knex from "knex";

import "dotenv/config";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await knex.schema.createTable("account", (table) => {
    table
      .uuid("id")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.string("connection_token");
    table.boolean("confirmed").defaultTo(false);
    table.boolean("is_admin").defaultTo(false);
    table.string("created_timestamp").notNullable();
  });

  await knex.schema.createTable("confirmation", (table) => {
    table
      .uuid("account_id")
      .references("id")
      .inTable("account")
      .onDelete("cascade")
      .notNullable();
    table.string("code").notNullable();
  });

  await knex.schema.createTable("game", (table) => {
    table
      .uuid("id")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("name").notNullable();
    table.string("author");
    table.text("description");
    table.json("custom_data");
    table
      .uuid("publisher_id")
      .references("id")
      .inTable("account")
      .onDelete("CASCADE")
      .notNullable();
  });

  await knex.schema.createTable("api_key", (table) => {
    table
      .uuid("key")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.timestamp("start_at").notNullable();
    table.string("name").notNullable();
    table
      .uuid("game_id")
      .references("id")
      .inTable("game")
      .onDelete("CASCADE")
      .notNullable();
    table
      .uuid("account_id")
      .references("id")
      .inTable("account")
      .onDelete("CASCADE")
      .notNullable();
  });

  await knex.schema.createTable("session", (table) => {
    table
      .uuid("id")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("platform");
    table.string("screen_size");
    table.string("software");
    table.string("external_id");
    table.json("custom_data");
    table.string("version");
    table
      .uuid("game_id")
      .references("id")
      .inTable("game")
      .onDelete("CASCADE")
      .notNullable();
  });

  await knex.schema.createTable("event", (table) => {
    table.increments("id").notNullable().primary();
    table.timestamp("user_time");
    table.timestamp("server_time").notNullable();
    table.string("type");
    table.json("custom_data");
    table.string("section");
    table.json("coordinates");
    table
      .uuid("session_id")
      .references("id")
      .inTable("session")
      .onDelete("CASCADE")
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("event");
  await knex.schema.dropTable("session");
  await knex.schema.dropTable("api_key");
  await knex.schema.dropTable("game");
  await knex.schema.dropTable("account");
}
