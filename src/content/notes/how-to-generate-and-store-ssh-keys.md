---
title: "How to Generate and Store SSH Keys"
date: "2021-03-06T19:45:42+00:00"
description: "There are two methods of logging into a remote system with SSH - using a password based login or by using SSH keys. Both have their pros and cons, but this article is going to focus on generating SSH keys and storing them in a config file for easy logins. This article will focus on the creation of new SSH keys."
topics:
  - ssh
ail: 0
---
# How to Generate and Store SSH Keys

There are two methods of logging into a remote system with SSH - using a password based login or by using SSH keys. Both have their pros and cons, but this article is going to focus on generating SSH keys and storing them in a config file for easy logins. This article will focus on the creation of new SSH keys.

> **Example**
>
> Always create a new name for the key pair when generating keys. For example, identify the key as id_rsa_mac for Macbook Pro, or id_rsa_local. These are two examples, but they can be named anything.

### Generating SSH Keys

Follow these instructions to create SSH keys.

* **Create a new key pair**
  * Open a terminal and run the following command: `ssh-keygen`
  * You will be prompted to save and name the key.
  * `Generating public/private rsa key pair. Enter file in which to save the key (/Users/USER/.ssh/id_rsa):`
  * Next you will be asked to create and confirm a passphrase for the key (highly recommended): `Enter passphrase (empty for no passphrase): Enter same passphrase again:`
  * This will generate two files, by default called `id_rsa` and `id_rsa.pub`.
  * Next, add this public key to each applicable machine.

Two files were created:

1. `id_rsa_xxx` – this is your key file that sits on the local machine.
2. `id_rsa_xxx.pub` – this is the public file that goes to your remote server.

### Copy the Public Key to a Remote Server

In order to copy the public key to the remote server, there are two different syntaxes that can be used:

```bash
ssh-copy-id user@123.45.56.78

ssh-copy-id -i id_rsa_xxx.pub user@123.45.56.78
```

This first is most effective when there is only one SSH key on a machine to copy, whereas the second should be used when there are multiple keys located on the local machine.

### Managing Multiple Keys

It’s good to have many keys, but by default, the `id_rsa.pub` file is always used unless noted otherwise. It will be required to tell ssh to look for a different public key file depending on the service. This is where the `config` files come in.

### Config file

The `config` file is located at `~/.ssh/config`. if it’s not there, it will need to be created manually as follows:

```bash
sudo nano ~/.ssh/config
```

The contents of the file will need to look like the following:

```shell
Host           server1
HostName       192.0.2.10
Port           22
IdentityFile   ~/.ssh/id_rsa_xxx
User           admin
```

* `Host` - this can be anything, but will generally be the name of the server.
* `HostName` - IP or host name. For our needs, use the IP address.
* `Port` - the port on the server that SSH is mapped to.
* `IdentityFile` - where the key file is located.
* `User` - the user we will be logging in as.

Now, in order to log into a particular server, the following syntax would be used:

`$ ssh myserver`.

Add more servers as needed.

```shell
Host           server1
HostName       192.0.2.10
Port           22
IdentityFile   ~/.ssh/id_rsa_xyz
User           admin

Host           server2
HostName       192.0.2.11
Port           22
IdentityFile   ~/.ssh/id_rsa_xyz
User           admin
```

### References

[https://www.digitalocean.com/docs/droplets/how-to/add-ssh-keys/create-with-openssh/](https://www.digitalocean.com/docs/droplets/how-to/add-ssh-keys/create-with-openssh/)

[https://clubmate.fi/how-to-setup-and-manage-multiple-ssh-keys/](https://clubmate.fi/how-to-setup-and-manage-multiple-ssh-keys/)


