---
title: "Backing up MySQL Database on Linux with Rclone and B2"
date: "2021-03-06T23:06:27+00:00"
description: "MySQL and MariaDB contain a utility called `mysqldump` which can be used for creating backup of a database or systems of databases. This utility creates a logical backup, which allows for granule recovery scenarios. Full backups are recommended for full disaster recovery scenarios."
topics:
  - mysql
  - rclone
  - b2
ail: 0
---
MySQL and MariaDB contain a utility called `mysqldump` which can be used for creating backup of a database or systems of databases. This utility creates a logical backup, which allows for granule recovery scenarios. Full backups are recommended for full disaster recovery scenarios.

**NOTE**: I have not yet got this working 100%. The syntax appears to work, but because the database is remote and not hosted locally, it doesn't seem to be making the connection to the remote database. Further testing and tweaking will be necessary.

### How the database backup functions

As an example, here’s a command for manually backing up all of the databases in the system.

```bash
mysqldump --all-databases --single-transaction --lock-tables=false > full-backup-$(date +%F).sql -u root -p
```

Breakdown of the options:

* `--all-databases` dumps all databases.
* `--single-transaction` option provides a way of making an online backup.
* `--lock-tables=false` by default, mysqldump will lock the table of your database during the dump process to make sure there will not have new data added during this time-frame. This may impact your apps during the db dump.
* `$(date +%F)` specifies the timestamp formatting. `%F` displays the full date.

### Setting up config file to not expose MySQL database password

As stated in the [MySQL End-User Guidelines for Password Security manual](https://dev.mysql.com/doc/refman/5.6/en/password-security-user.html), our best option is to store the password in an option file. Putting the password in `crontab` in convenient but insecure, as every time the command runs, the password can be visible in `ps`.

Create a new user where you’ll be running the crontab and Rclone. In the user’s home directory, create a new `.your_filename_here.cnf` and restrict it by running the command `chmod 600 /home/user/.your_filename_here.cnf`.

Example .cnf file:

```shell
[client]
user = root
password = mysql_root_pwd
```

We can then add `--defaults-extra-file=/home/bckusr/.my.cnf` when using the mysqldump command for logging in.

### (Optional) Setting up the default editor for crontab

A bit controversial, but if you don’t like `vi` and prefer `nano` instead, you can change the default editor for a specific user by editing `.bash_profile`. To change the editor, paste this into your bash profile, save it, then logout and login (exit from the SSH session as well):

```shell
export VISUAL="nano"
export EDITOR="nano"
```

### Setting up RClone

Follow the [RClone Backblaze B2](https://rclone.org/b2/) configuration documentation for setting up RClone.

### Setting up crontab

Execute `crontab -e` as the user you want to run backups from. You can use [Crontab Guru](https://crontab.guru/) for quickly setting up the cron schedule execution.

Here’s what the crontab for daily backup running at 1 AM looks like:

```bash
0 1 * * * /usr/bin/mysqldump mysql -h <cluster-host> -P <port> -u <user> --defaults-extra-file=/home/<user>/.my.cnf -u root --single-transaction --lock-tables=false --all-databases > full-backup-$(date +\%F).sql && rclone copy /home/<user>/full-backup-*.sql b2:<bucket>/DigitalOcean && rm -rf /home/bckusr/full-backup-*.sql && <healthchecks.io ping url>
```

This creates a new database backup, which then copies the backup to b2. After successfully copying to b2, it cleans up after itself and removes the local mysqldump.

### Resources

* [https://thunderysteak.github.io/thunderysteak.github.io/linux-mysql-azure-bck.html](https://thunderysteak.github.io/thunderysteak.github.io/linux-mysql-azure-bck.html)
* [https://stackoverflow.com/questions/2989724/how-to-mysqldump-remote-db-from-local-machine\#2990732](https://stackoverflow.com/questions/2989724/how-to-mysqldump-remote-db-from-local-machine#2990732)


