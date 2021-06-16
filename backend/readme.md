# Red Metrics v2

Open game analytics

## Building with Docker

1. Create your .env file from the template
    ```cp .env.template .env```

2. To recreate container (after changing docker file)
    ```yarn docker```

3. To test docker container by logging into CLI
    1) start container
        ```docker run -td test-docker-compose_web```
    2) enter container
        ```docker exec -it redmetrics2 /bin/bash```

## Developing the database

Migrations are created in TypeScript in the `migrations_src` directory and compiled to the standard `migrations` directory in JS, before being run.

To build and run the migrations, use `yarn knex migrate`.