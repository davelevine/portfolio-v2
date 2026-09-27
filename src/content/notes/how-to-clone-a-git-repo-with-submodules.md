---
title: "How to Clone a Git Repository with Submodules"
date: "2021-04-05T21:15:22-04:00"
description: "This will be a quick article to list the steps to take in order to clone a submodule with git."
topics:
  - git
  - submodules
ail: 0
---
This will be a quick article to list the steps to take in order to clone a submodule with git.

## Steps Needed

* Navigate to the proper directory by using `cd ~/Downloads/GitHub/<repo>`.
* Once in the proper directory, do the following:

```bash
submodule@example:~$ git clone https://github.com/user/repo.git
submodule@example:~$ git submodule init
submodule@example:~$ git submodule update
```

Once this has been completed, the repo can be used as a submodule.

## References

<https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/How-to-clone-a-git-repository-with-submodules-init-and-update>


