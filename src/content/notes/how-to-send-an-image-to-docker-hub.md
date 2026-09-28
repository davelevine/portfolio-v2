---
title: "How to Send an Image to Docker Hub"
date: "2021-03-06T21:53:07+00:00"
description: "This article will explain a quick method to sending a self hosted image to Docker Hub."
topics:
  - docker
ail: 0
---
This article will explain a quick method to sending a self hosted image to Docker Hub.

### Logging into Docker Hub

First, a repository needs to be created on Docker Hub. This can be done with the following steps:

1. Log in on [https://hub.docker.com/](https://hub.docker.com/)
2. Click on _**Create Repository**_.
3. Choose a name and a description for your repository and click _**Create**_.

Next, log into Docker Hub via the command line

```bash
docker login --username=<username>
```

Enter the password for Docker Hub when prompted. If the login is successful, it should show the following:

```bash
WARNING: login credentials saved in /home/username/.docker/config.json
Login Succeeded
```

### Sending an Image to Docker Hub

In order to send an image to Docker Hub, it needs to contain a **tag**. The **tag** will be the **Image ID** for the container being sent to Docker Hub.

Check the image ID using docker images, which should show the following:

```bash
─[root@docker-host]─[~]
└──╼ #docker images
REPOSITORY              TAG                 IMAGE ID            CREATED             SIZE
portainer/portainer     latest              4cda95efb0e4        2 hours ago         80.6MB
linuxserver/tautulli    latest              3a3f10feca76        11 hours ago        190MB
rancher/rancher         latest              ff8481dd1f0e        2 days ago          645MB
linuxserver/ombi        latest              e4d82814a9c2        2 days ago          376MB
linuxserver/heimdall    latest              a8c5afd1e528        6 days ago          78.8MB
solidnerd/bookstack     latest              e0863497ab72        2 weeks ago         718MB
linuxserver/tautulli    <none>              39ad571984b3        5 weeks ago         190MB
portainer/portainer     <none>              2b4ddf654e1c        2 months ago        77.7MB
datadog/agent           latest              5088733b7951        4 months ago        458MB
pyouroboros/ouroboros   latest              56d4dc0ea00c        5 months ago        106MB
nicolargo/glances       latest              e11d9ef79840        8 months ago        618MB
mysql                   5.7.21              5195076672a7        19 months ago       371MB
```

If we wanted to send the **mysql** image to Docker Hub, the following would need to be entered:

`docker tag 5195076672a7 <username>/portainer-repo:mysql`

In general, a good choice for a tag is something that will help you understand what this container should be used in conjunction with, or what it represents. If this container contains the analysis for a paper, consider using that paper’s DOI or journal-issued serial number; if it’s meant for use with a particular version of a code or data version control repo, that’s a good choice too - whatever will help you understand what this particular image is intended for.

The image is now ready to be pushed to Docker Hub:

`docker push <username>/portainer-repo:mysql`

### References

[https://ropenscilabs.github.io/r-docker-tutorial/04-Dockerhub.html](https://ropenscilabs.github.io/r-docker-tutorial/04-Dockerhub.html)


