---
title: "How to Backup Files with Git using Visual Studio Code"
date: "2021-03-06T21:16:30+00:00"
description: "This article will consist of information related to backing up notes to Github by way of Visual Studio \\(VS\\) Code."
topics:
  - vscode
  - git
ail: 0
---
This article will consist of information related to backing up notes to Github by way of Visual Studio (VS) Code.

### Why Do This?

Git is a fantastic way of implementing version control in an environment. I started using VS Code just as a replacement for Sublime Text, but then realized I could use Git and connect it to my Github account.

### How to Connect VS Code to Github

The steps I used to connect VS Code to Github are as follows:

1. Create a directory on the local file system.
   * **Github** --&gt; **Notes**
2. Create a repo on Github.
   * Repo is called **Notes**
3. Open the repo and clone it.
   * `git clone https://github.com/<username>/notes.git`
4. Open **VS Code** --&gt; select **File** --&gt; **Add Folder to Workspace** --&gt; Select the **Notes** directory
5. Open a Terminal Window in VS code and type the following:

```bash
git remote add origin https://github.com/{username}/{reponame.git}
git remote -v
git pull origin master
```

### Wrapping Up

At this point, VS Code is now connected to that particular repo on Github. Any new documents created will be created in the Notes folder, unless otherwise specified. The process to commit changes to Github is listed below:

* Save any changes to the notes (**Ctrl + S**)
* VS Code will prompt that there are new changes to commit.
* Stage the changes by clicking on the **+** symbol.
* Once the changes have been staged, click the **check mark** for the **Notes** repo to commit.
* VS Code will prompt for a commit message.
* Provide a commit message and click Enter.
* Look for the **Source Control Provider** list, find the repo in it and click the option for **Synchronize Changes**.

**NOTE**: A quick change that can be made to automatically synchronize changes is to navigate to **Preferences** --&gt; **Settings** --&gt; **Extensions** --&gt; **Git**. Look for **Post Commit Command** and select **Sync**

### References

[**https://www.notyourdadsit.com/blog/2018/4/3/cheatsheet-setup-github-on-visual-studio-code**](https://www.notyourdadsit.com/blog/2018/4/3/cheatsheet-setup-github-on-visual-studio-code)

[**https://code.visualstudio.com/Docs/editor/versioncontrol**](https://code.visualstudio.com/Docs/editor/versioncontrol)


