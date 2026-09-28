---
title: "How to Add Git Repo to VS Code"
date: "2021-03-06T21:16:30+00:00"
description: "This article will list the steps required to add an existing Git repo to VS Code."
topics:
  - vscode
  - git
ail: 0
---
# How to Add Git Repo to VS Code

This article will list the steps required to add an existing Git repo to VS Code.

### Add Repo to VS Code

* Create a new local folder (ex. ~/Downloads/GitHub)
* Initialize the folder for git usage with `git init`.
* Configure the git repo with your information:
  * git config --global user.name "Dave"
  * git config --global user.email "you@example.com"
* Add the remote repository to the local folder
  * git remote add origin [https://github.com/<username>/repo.git](https://github.com/<username>/repo.git)
* Confirm repo was added properly
  * `git remote -v`
  * `git remote show origin`
* Tell VS Code which branch to pull repo information from
  * `git pull --rebase origin master`
* Tell VS Code which branch to push changes to
  * `git push -u origin master`

### Push Test Commit

* In the terminal, create a test file and push it to the repo by typing the following:
  * touch test.txt
  * git add .
  * git status
  * git commit -m 'test'
  * git push


