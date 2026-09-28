---
title: "Database Queries"
date: "2021-08-02T10:54:38-04:00"
description: ""
topics:
  - mysql
ail: 0
---
## Get DB Size

```sql
SELECT table_schema "Database",
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) "DB Size in MB" 
FROM information_schema.tables 
GROUP BY table_schema;
```

## Missing Primary Keys

```sql
SELECT
 tab.table_schema AS database_name,
 tab.table_name AS table_name,
 tab.table_rows AS table_rows
FROM
 information_schema.tables tab
 LEFT JOIN information_schema.table_constraints tco ON (tab.table_schema = tco.table_schema
   AND tab.table_name = tco.table_name
   AND tco.constraint_type = 'PRIMARY KEY')
WHERE
 tab.table_schema NOT IN('mysql', 'information_schema', 'performance_schema', 'sys')
 AND tco.constraint_type IS NULL
 AND tab.table_type = 'BASE TABLE';
```

## Update Image URL

```sql
UPDATE
 images
SET
 url = REPLACE(url, 'cdn.levine.io', 'cdn.levine.io')
WHERE
 url LIKE '%cdn.levine.io%';
```

## References

<https://tableplus.com/blog/2018/08/mysql-how-to-find-and-replace-text-in-string.html>


