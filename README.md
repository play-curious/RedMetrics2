# Red Metrics v2

Open game analytics

## Building with Docker

This project uses a `package.json` file only to run scripts through yarn or npm.

1. Create your .env file from the template
   `cp .env.template .env`

2. To start containers, run `yarn start`

3. To force rebuild of containers upon start, run `yarn start-no-build`

4. To test docker container by logging into CLI

   1. Enter/connect to the container
      `yarn connect-backend` or `yarn connect-frontend`
   2. Stop containers
      `yarn stop`
   3. Remove containers
      `yarn remove`

5. To run the test suite on the backend, run the container, connect to it, and run `yarn test`

## Developing the database

Migrations are created in TypeScript in the `backend/migrations_src` directory and compiled to the standard `backend/migrations` directory in JS, before being run.

To build and run the migrations, use `yarn knex migrate` on the backend.
