---
title: "How to Remove a Commit"
date: "2021-03-06T21:16:30+00:00"
description: "This article will quickly explain how to remove a previous commit using Git."
topics:
  - git
ail: 0
---
This article will quickly explain how to remove a previous commit using Git.

### How-to

To remove the last commit from git, you can simply run `git reset --hard HEAD^` If you are removing multiple commits from the top, you can run git reset --hard HEAD~2 to remove the last two commits. You can increase the number to remove even more commits.

If you want to "un-commit" the commits, but keep the changes around for reworking, remove the "--hard": `git reset HEAD^` which will evict the commits from the branch and from the index, but leave the working tree around.

If you want to save the commits on a new branch name, then run `git branch newbranchname` before doing the git reset.

### Specific Cases

* `git reset --hard <commit-id>` can be used to remove a specific commit-id from the last commit you want to jump back to.
* To force to remove the last commit from git,  
  use these 2 following commands:

  ```bash
  git reset --hard HEAD^
  git push origin -f
  ```

### Reference

* [https://gist.github.com/CrookedNumber/8964442](https://gist.github.com/CrookedNumber/8964442)


