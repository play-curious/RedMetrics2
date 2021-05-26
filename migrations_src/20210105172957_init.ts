import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await knex.schema.createTable("account", (table) => {
    table
      .uuid("id")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.string("email").notNullable();
    table.string("password").notNullable();
    table.enum("role", ["admin", "dev", "user"], {
      useNative: true,
      enumName: "role",
    });
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

    table.uuid("publisher_id").notNullable();
    table.foreign("publisher_id").references("account.id").onDelete("CASCADE");
  });

  //  TODO: shouldn't be needed
  await knex.schema.createTable("game_account", (table) => {
    table.uuid("game_id").notNullable();
    table.foreign("game_id").references("game.id");

    table.uuid("account_id").notNullable();
    table.foreign("account_id").references("account.id");
  });

  await knex.schema.createTable("session", (table) => {
    table
      .uuid("api_key")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));

    table.timestamp("start_at").notNullable();
    table.string("name").notNullable();

    table.uuid("game_id");
    table.foreign("game_id").references("game.id");

    table.uuid("account_id").notNullable();
    table.foreign("account_id").references("account.id").onDelete("CASCADE");

    table.json("permissions").notNullable().defaultTo([]);

    // TODO: is this unnecessary?
    table.boolean("logger").notNullable().defaultTo(false);
  });

  await knex.schema.createTable("game_version", (table) => {
    table
      .uuid("id")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));

    table.string("name").notNullable();
    table.text("description");
    table.json("custom_data");

    table.uuid("game_id").notNullable();
    table.foreign("game_id").references("game.id");
  });

  await knex.schema.createTable("game_session", (table) => {
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

    table.uuid("game_version_id").notNullable();
    table
      .foreign("game_version_id")
      .references("game_version.id")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable("event", (table) => {
    table.increments("id").notNullable().primary();
    table.timestamp("user_time");
    table.timestamp("server_time").notNullable();
    table.string("type");
    table.json("custom_data");
    // TODO: shouldn't this be a ltree?
    table.string("section");
    table.json("coordinates");

    table.uuid("game_session_id").notNullable();
    table
      .foreign("game_session_id")
      .references("game_session.id")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("event");
  await knex.schema.dropTable("game_session");
  await knex.schema.dropTable("game_version");
  await knex.schema.dropTable("session");
  await knex.schema.dropTable("game_account");
  await knex.schema.dropTable("game");
  await knex.schema.dropTable("account");
  await knex.schema.raw("drop type role");
}
