# Red Metrics v2

Open game analytics

## Building with Docker

This project uses a `package.json` file only to run scripts through yarn (preferred) or npm.

1. Create your .env file from the template
   `cp .env.template .env`

2. To build & start containers, run `yarn start`

3. To avoid rebuilding containers upon start, run `yarn start-no-build`

4. To test docker container by logging into CLI

   1. Enter/connect to the container
      `yarn connect-backend` or `yarn connect-frontend`
   2. Stop containers
      `yarn run stop`
   3. Remove containers
      `yarn run remove`

5. To run the test suite on the backend, run the container, connect to it, and run `yarn test`

6. To run the backend in watch mode, first stop the existing backend container. Then use the command `docker-compose run --service-ports backend yarn watch`.

## Developing the database

Migrations are created in TypeScript in the `backend/migrations_src` directory and compiled to the standard `backend/migrations` directory in JS, before being run.

To build and run the migrations, use `npx knex migrate` on the backend.

## Admin account

To create an admin account, run `yarn seed` on the backend. It will create an account with the email `ADMIN_EMAIL` and `ADMIN_PASSWORD`, if they are in the `.env` file, or they will use a preset email and random password. The account information will be written to standard out.
