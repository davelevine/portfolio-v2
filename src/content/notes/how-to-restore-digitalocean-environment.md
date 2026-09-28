---
title: "How to Restore DigitalOcean Environment"
date: "2021-03-06T15:32:12+00:00"
description: "This article falls under the category of Disaster Recovery. It will serve as a step-by-step guide for restoring my entire DigitalOcean environment in the event of a disaster."
topics:
  - digitalocean
ail: 0
---
This article falls under the category of Disaster Recovery. It will serve as a step-by-step guide for restoring my entire DigitalOcean environment in the event of a disaster.

> **Note**
>
> This article should be used as a general overview and may vary slightly from a real world scenario.

### Considerations

There are currently a number of safeguards in place to make sure that my DigitalOcean environment can be restored, which are listed below:

#### Snapshots

* The quickest and most basic method of restoration. Automatic snapshots are created daily at 2am.
* Contingent on retaining access to DigitalOcean account.

#### File Backups

* Rclone and cron are used extensively on the `do-docker` droplet to backup the following to Backblaze B2:

```shell
# Unifi Backup
0 1 * * * rclone sync /home/<user>/.config/appdata/unificontroller/data/backup/autobackup b2:<bucket>/Unifi --verbose --log-file=/home/<user>/logs/unifi_b2.log && curl -fsS --retry 3 -o /dev/null https://hc-ping.com/<uuid>

# Ghost Backup
30 1 * * 1 rclone copy /opt/ghost_content b2:<bucket>/ghost && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/<uuid>

# Wallabag Backup
0 1 * * 1 rclone copy /opt/wallabag b2:<bucket>/Docker/Volumes/wallabag && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/<uuid>

# Monica Backup
0 2 * * 1 rclone copy /opt/monica b2:<bucket>/Docker/Volumes/monica && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/<uuid>
```

#### Databases

DigitalOcean Managed Database

* Automatic point in time backups managed by DigitalOcean.  
* Additional daily backup of Bookstack database done by [Snapshooter.io](https://snapshooter.io) and sent to B2.

#### Git

The following configurations are regularly backed up to GitHub:

* [Docker-Compose.yml](https://github.com/davelevine/docker)
* [Monica .env file](https://github.com/davelevine/docker/blob/master/monica/.env)
* [Nginx configurations](https://github.com/davelevine/nginx-config)

### Disaster Recovery

The following instructions can be used as a guide in order to restore an entire environment:

* Create a new droplet from scratch using Ubuntu.

> **Note**
>
> The size of the droplet should not necessarily matter as it can always be scaled, but at the time of this writing, the droplet details are as follows:

| **Image** | Ubuntu (docker-s-1vcpu-2gb-nyc1-01) |
| :---: | :---: |
| **Size** | 1vCPUs 2GB / 50GB Disk ($10/mo) |
| **Region** | NYC1 |
| **IPv4** | 203.0.113.10 |
| **IPv6** | N/A |
| **Private IP** | <private-ip> |
| **VPC** | default-nyc1 |

* Install [rclone](https://rclone.org) and configure B2 as an endpoint.
* Install [Docker](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04)
* Copy the [Docker-Compose.yml](https://github.com/davelevine/docker) file to `~/.docker/compose` and run `docker-compose up -d`.

> **Tip**
>
> Check [Docker-Compose.yml](https://github.com/davelevine/docker) file to make sure any environment variables are accounted for and volume locations exist.

* Use rclone to restore Unifi, Ghost, Monica & Wallabag using the following syntax:

```shell
# Unifi Restore
rclone copy b2:<bucket>/Unifi /home/<user>/.config/appdata/unificontroller/data/backup/autobackup

# Ghost Restore
rclone copy b2:<bucket>/ghost /opt/ghost_content

# Wallabag Restore
rclone copy b2:<bucket>/Docker/Volumes/wallabag /opt/wallabag

# Monica Restore
rclone copy b2:<bucket>/Docker/Volumes/monica /opt/monica
```

* Additionally, restore Heimdall to the `/home/<user>/.config/appdata/heimdall` folder with rclone.
  * `rclone copy b2:<bucket>/Docker/Appdata/heimdall /home/<user>/.config/appdata/`
* Install Nginx with `sudo apt install nginx -y`.
* Restore [Nginx configurations](https://github.com/davelevine/nginx-config) to `/etc/nginx/sites-available` and `/etc/nginx`.
  * Create any symlinks as necessary

```shell
sudo ln -s /etc/nginx/sites-available/<service>.conf /etc/nginx/sites-enabled/<service>.conf
```

* Reload Nginx as necessary with `sudo service nginx restart`.
* Install [Searx](https://asciimoo.github.io/searx/admin/installation.html)
* Consider the database to be fully operational, but should it need to be restored from a backup, reference the backup and restore a MySQL database article.
* Migrate an existing MySQL database with the following command:

```sql
mysql -u <user> -pshow-password -h <cluster-host> -P <port> < <local-sql-dump-path>
```

* Update Cloudflare DNS records with a new public IP if necessary.
* Verify connectivity of all services to ensure everything came back as it should with all data intact.


