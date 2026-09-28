---
title: "How to Fix a Detached HEAD on a Git Repository"
date: "2021-10-31T00:02:50-04:00"
description: "Occasionally, when making changes to a branch of a git repo, the HEAD (last commit on a branch) may become detached from the branch. This most commonly happens when a single commit is checked out from the commit history. This is problematic because if it isn't resolved, any additional work will need to be stashed until the HEAD can be reattached to a particular branch."
topics:
  - git
ail: 0
---
Occasionally, when making changes to a branch of a git repo, the HEAD (last commit on a branch) may become detached from the branch. This most commonly happens when a single commit is checked out from the commit history. This is problematic because if it isn't resolved, any additional work will need to be stashed until the HEAD can be reattached to a particular branch.

## How to Identify a Detached HEAD

There are a handful of ways to identify a detached HEAD. One of which is in the Source List of a code editor. It will show the commit that's been checked out instead of the name of the branch (ex. Master branch). Another is trying to run `git pull`. It will likely provide the following error:

`You are not currently on a branch. Please specify which branch you want to merge with.`

## How to Reattach the HEAD to a Git Branch

The HEAD of a git branch can be reattached in a number of ways, but the following is the easiest method I've used so far...

* Check all files and revert all changes.

```bash
git status
```

* Switch branch to Master

```bash
git checkout master
```

* Update repository

```bash
git pull
```

## References

* <https://stackoverflow.com/a/1022920*2>
* <https://dawnarc.com/2019/04/versioncontrolgit-you-are-not-currently-on-a-branch.-please-specify-which-branch-you-want-to-merge-with/>
* <https://ilikekillnerds.com/2014/05/how-to-fix-a-detached-head-on-a-git-repository/>


