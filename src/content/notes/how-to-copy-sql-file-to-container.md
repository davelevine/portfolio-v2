---
title: "How to Copy an SQL File to a Docker Container"
date: "2021-10-20T22:57:10-04:00"
description: "The content of this article will be largely taken from an article I found. The article details the steps required to copy an SQL file into a Docker container and load the file as a database."
topics:
  - docker
  - mysql
ail: 0
---
The content of this article will be largely taken from an article I found. The article details the steps required to copy an SQL file into a Docker container and load the file as a database.

This article assumes a few things...

* That the MySQL database has already been exported into a `.sql` file.
* That a MySQL container has already been pulled and configured.

## Copy a SQL File to a Docker Container

First, make note of where the `.sql` file is located on the machine. Once this is done, the Docker container ID will be needed. This can be found by using the `docker ps` command.

This will list all the Docker container and their respective IDs. Locate the ID for the container relating to MySQL.

```properties
CONTAINER ID             IMAGE                   ...
[YourContainerId]        mysql:5.7.29            ...CONTAINER ID  
```

Now copy the sql file using `docker cp` into the container.

```bash
docker cp your.sql [YourContainerId]:/your.sql
```

Once complete, login to the container and import the MySQL database.

```bash
docker exec -it [YourContainerId] bin/bash
```

Once logged into the container, now log into MySQL.

```sql
mysql -u root -p
```

To see the databases, run...

```sql
show databases;
```

Select the database that will be imported...

`use your-database-name`

Now import by running...

```sql
source your.sql
```

## Wrapping Up

At this point, the database should be active and ready to accept connections. Depending on the application being used, additional configurations will likely need to be made so that the new database is utilized.

## References

* <https://grant-bartlett.com/blog/copying-a-sql-file-to-docker-container-for-import/>


