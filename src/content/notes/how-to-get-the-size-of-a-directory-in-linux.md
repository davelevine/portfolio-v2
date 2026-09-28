---
title: "How to Get the Size of a Directory in Linux"
date: "2021-03-06T21:42:11+00:00"
description: "This will be a quick article on how to obtain the size of a directory, regardless of which flavor of Linux is being run."
topics:
  - linux
ail: 0
---
This will be a quick article on how to obtain the size of a directory, regardless of which flavor of Linux is being run.

### Getting the Size of a Directory

The [`du`](https://linuxize.com/post/du-command-in-linux/) command displays the amount of file space used by the specified files or directories. If the specified path is a directory, `du` summarizes disk usage of each subdirectory in that directory. If no path is specified, `du` reports the disk usage of the [current working directory](https://linuxize.com/post/current-working-directory/).

When invoked without any options, `du` displays the disk usage of the given directory and each of its subdirectories in bytes.

Typically, you would want to display the space occupied by the directory in a human-readable format. For example, to get the total size of the `/var` directory, you would run the following command:

```shell
sudo du -sh /var
```

The output will look something like this:

```shell
85G    /var
```

Let’s explain the command and its arguments:

* The command starts with `sudo` because most of the files and directories inside the `/var` directory are owned by the root user and are not readable by the regular users. If you omit [`sudo`](https://linuxize.com/post/sudo-command-in-linux/) the `du` command will print “du: cannot read directory”.
* `s` - Display only the total size of the specified directory, do not display file size totals for subdirectories.
* `h` - Print sizes in a human-readable format (`h`).
* `/var` - The path to the directory you want to get the size.

What if you want to display the disk usage of the first-level subdirectories? You have two options. The first one is to use the asterisk symbol (`*`) as shown below, which means “match everything that doesn’t start with a period (`.`)”. The `-c` option tells `du` to print a grand total of all sizes:

```shell
sudo du -shc /var/*
```

```shell
24K    /var/db
4.0K    /var/empty
4.0K    /var/games
77G    /var/lib
4.0K    /var/local
0    /var/lock
3.3G    /var/log
0    /var/mail
4.0K    /var/opt
0    /var/run
196K    /var/spool
28K    /var/tmp
85G    total
```

Another way to get a report about the disk usage of the first-level subdirectories is to use the `--max-depth` option:

```shell
sudo du -h --max-depth=1 /var
```

```shell
77G      /var/lib
24K      /var/db
4.0K    /var/empty
4.0K    /var/local
4.0K    /var/opt
196K    /var/spool
4.0K    /var/games
3.3G    /var/log
5.0G    /var/cache
28K    /var/tmp
85G    /var
85G    total
```

By default, the `du` command shows the disk space used by the directory or file. To find the apparent size of a directory, use the `--apparent-size` option. The “apparent size” of a file is how much data is actually in the file.

```shell
sudo du -sh --apparent-size /var
```

When you transfer a directory via [SCP](https://linuxize.com/post/how-to-use-scp-command-to-securely-transfer-files/), [Rsync](https://linuxize.com/post/how-to-use-rsync-for-local-and-remote-data-transfer-and-synchronization/)., or [SFTP](https://linuxize.com/post/how-to-use-linux-sftp-command-to-transfer-files/) the amount of data that is transferred over the network is the apparent size of the files. This is why the size of space on the disk used on the source when displayed with `du` (without `--apparent-size`) is not the same as the size on the target.

The `du` command can also be combined with other commands with pipes.

For example, to print the 5 [largest directories](https://linuxize.com/post/find-large-files-in-linux/) within the `/var` directory, you would pipe the output of `du` to the `sort` command to sort the directories by their size and then pipe the output to the [`head`](https://linuxize.com/post/linux-head-command/) command that will print only the top 5 directories:

```shell
sudo du -h /var/ | sort -rh | head -5
```

```shell
85G    /var/
77G    /var/lib
75G    /var/lib/libvirt/images
75G    /var/lib/libvirt
5.0G    /var/cache/pacman/pkg
```

### Reference

* [https://linuxize.com/post/how-get-size-of-file-directory-linux/](https://linuxize.com/post/how-get-size-of-file-directory-linux/)


