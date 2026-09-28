---
title: "How to Obtain the Size of the MySQL Managed Database"
date: "2021-03-06T15:54:44+00:00"
description: "This article will list the steps involved in obtaining the size of the MySQL Managed database on DigitalOcean."
topics:
  - mysql
  - digitalocean
ail: 0
---
This article will list the steps involved in obtaining the size of the MySQL Managed database on DigitalOcean.

> **Tip**
>
> The query listed below will be done on a Mac using [TablePlus](https://tableplus.com/), but can be done in any application that makes use of SQL queries.

### How-To

* Open TablePlus and connect to the database.

```sql
username = <user>
password = ****************
host = <cluster-host>
port = <port>
database = defaultdb
sslmode = REQUIRED
```

* Open the **SQL Query** section.
* Run the following query, which should return the output below:

```sql
SELECT table_schema "Database",
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) "DB Size in MB" 
FROM information_schema.tables 
GROUP BY table_schema;
```

| **Database** | **DB Size in MB** |
| :---: | :---: |
| bookstack | 21.6 |
| defaultdb | 18.6 |
| ghost_production | 1.8 |
| information_schema | 0.0 |
| mysql | 7.8 |
| performance_schema | 0.0 |
| sys | 0.0 |

### Resources

[https://stackoverflow.com/a/1733523](https://stackoverflow.com/a/1733523)


