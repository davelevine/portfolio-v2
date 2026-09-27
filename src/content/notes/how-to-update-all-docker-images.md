---
title: "How to Update All Docker Images"
date: "2021-03-19T21:16:49-04:00"
description: "This will be a quick article on how to update all Docker images at once."
topics:
  - docker
ail: 0
---
This will be a quick article on how to update all Docker images at once.

## Docker Update

-----

Docker does not have a command to update images that you have already pulled. The only way is to pull all images again using docker pull <image> command. This simple one-liner can help you update all images at once.

```bash
docker images |grep -v REPOSITORY|awk '{print $1}'|xargs -L1 docker pull 
```

## References

-----

<https://www.googlinux.com/update-all-docker-images/>


