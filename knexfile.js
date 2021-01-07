module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: +(process.env.PGPORT ?? 5432),
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    loadExtensions: ['.js']
  }
};
