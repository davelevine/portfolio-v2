---
title: "How to Store Git Credentials for VSCode"
date: "2021-03-06T21:16:30+00:00"
description: "This will be a quick article about how to store Git credentials for VSCode. This is convenient so that VSCode doesn't ask for credentials each time you want to do a push/pull from GitHub."
topics:
  - vscode
  - git
ail: 0
---
# How to Store Git Credentials for VSCode

This will be a quick article about how to store Git credentials for VSCode. This is convenient so that VSCode doesn't ask for credentials each time you want to do a push/pull from GitHub.

### How to Store Git Credentials

* Open VSCode and then open a terminal window within VSCode.
* Set credential helper to **store** `$ git config --global credential.helper store`
  * Global flag is used to associate credentials with all GitHub repos.

The following is the syntax used to store credentials:

```bash
$ git config credential.helper store
$ git push http://example.com/repo.git
Username: < type your username >
Password: < type your password >
```

At this point, your credentials will be used automatically when using the following:

`$ git push https://github.com/repo.git`  
`$ git pull https://github.com/repo.git`

If for any reason the above doesn't work, it's because the Github email and your name are missing. Do the following:

* Open a terminal
* Type the following:

```bash
git config --global user.email "you@example.com"
git config --global user.name "Dave"
```

* Retry pushing or pulling from the repo.

### Reference

* [https://stackoverflow.com/questions/34400272/visual-studio-code-always-asking-for-git-credentials](https://stackoverflow.com/questions/34400272/visual-studio-code-always-asking-for-git-credentials)


