import { Knex } from "knex";

import "dotenv/config";

type Mod<
  T extends
    | Knex.ColumnBuilder
    | Knex.ReferencingColumnBuilder = Knex.ColumnBuilder
> = (knex: Knex, table: Knex.CreateTableBuilder) => T;

function id(alias?: string): Mod {
  return (knex, table) => {
    return table
      .uuid(alias ?? "id")
      .notNullable()
      .primary()
      .defaultTo(knex.raw("uuid_generate_v4()"));
  };
}

function date(name: string): Mod {
  return (knex, table) => {
    return table.datetime(name + "_timestamp");
  };
}

function ref(
  tableName: string,
  alias?: string
): Mod<Knex.ReferencingColumnBuilder> {
  return (knex, table) => {
    return table
      .uuid((alias ?? tableName) + "_id")
      .references("id")
      .inTable(tableName)
      .onDelete("cascade")
      .notNullable();
  };
}

const custom: Mod = (knex, table) => {
  return table.json("custom_data");
};

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await knex.schema.createTable("account", (table) => {
    id()(knex, table);
    date("created")(knex, table).notNullable();
    table.string("email").unique().notNullable();
    table.string("password").notNullable();
    table.string("connection_token");
    table.boolean("confirmed").defaultTo(false);
    table.boolean("is_admin").defaultTo(false);
  });

  await knex.schema.createTable("confirmation", (table) => {
    ref("account")(knex, table);
    table.string("code").notNullable();
  });

  await knex.schema.createTable("game", (table) => {
    id()(knex, table);
    ref("account", "publisher")(knex, table);
    custom(knex, table);
    table.string("name").notNullable();
    table.string("author");
    table.text("description");
  });

  await knex.schema.createTable("api_key", (table) => {
    id("key")(knex, table);
    ref("game")(knex, table);
    ref("account")(knex, table);
    date("start")(knex, table).notNullable();
    table.string("description");
  });

  await knex.schema.createTable("session", (table) => {
    id()(knex, table);
    ref("game")(knex, table);
    date("created")(knex, table).notNullable();
    date("updated")(knex, table).notNullable();
    custom(knex, table);
    table.boolean("closed");
    table.string("platform");
    table.string("screen_size");
    table.string("software");
    table.string("external_id");
    table.string("version");
  });

  await knex.schema.createTable("event", (table) => {
    table.increments("id").notNullable().primary();
    date("user")(knex, table);
    date("server")(knex, table).notNullable();
    custom(knex, table);
    ref("session")(knex, table);
    table.string("type");
    table.string("section");
    table.json("coordinates");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("confirmation");
  await knex.schema.dropTable("event");
  await knex.schema.dropTable("api_key");
  await knex.schema.dropTable("session");
  await knex.schema.dropTable("game");
  await knex.schema.dropTable("account");
}
