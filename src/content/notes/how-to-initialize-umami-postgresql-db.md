---
title: "How to Initialize PostgreSQL DB for Umami"
date: "2021-04-05T22:32:22-04:00"
description: "This will be a quick article on how to initialize a PostgreSQL Database running in Docker for Umami. Since the database exists within a Docker container, the command will need to be run from within the Docker container."
topics:
  - docker
  - postgres
ail: 0
---
This will be a  quick article on how to initialize a PostgreSQL Database running in Docker for Umami. Since the database exists within a Docker container, the command will need to be run from within the Docker container.

> **Note**
>
> This article assumes Umami is already installed with Docker. Instructions on how to do this can be found [here](https://umami.is/docs/install)

## How-To

In order to run the command, do the following:

* Log into Orchestrator (Portainer)
* Open the **Containers** section
* Open the Umami DB (PostgreSQL) container and access the Console
* Once the console loads, run the following command:

```sql
psql -h 127.0.0.1 -U umami -d umami -f /docker-entrypoint-initdb.d/schema.postgresql.sql
```

This will automatically populate the database with the proper schema required to run Umami.

## References

<https://umami.is/docs/install>
<https://github.com/mikecao/umami/issues/449#issuecomment-800265630>


