# Red Metrics v2

Open game analytics

## Building with Docker

1. Create your .env file from the template
    ```cp .env.template .env```

2. To recreate container (after changing docker file)
    ```docker-compose up --build```

3. To test docker container by logging into CLI
    1) start container
        ```docker run -td test-docker-compose_web```
    2) enter container
        ```docker exec -it interesting_robinson /bin/bash```

## Developing the database

To create a migration using Knex in TypeScript format, use `yarn knex migrate:make <migration name> -x ts`
