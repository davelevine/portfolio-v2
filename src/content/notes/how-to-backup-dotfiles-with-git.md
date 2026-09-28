---
title: "How to Backup Dotfiles with Git"
date: "2021-03-06T19:14:13+00:00"
description: "This article will be a how-to on backing up dotfiles in Manjaro Openbox using Git."
topics:
  - git
  - dotfiles
  - openbox
ail: 0
---
This article will be a how-to on backing up dotfiles in Manjaro Openbox using Git.

### Getting Started

I've seen quite a number of ways to backup dotfiles, but there's a pretty quick method that I keep coming back to. After trying it out, it's pretty straightforward, and that's what I'll be outlining below.

### Organizing Dotfiles

Dotfiles typically live within the Home directory, but since the Home directory can store a lot of other data, it's just easier to keep the dotfiles in their own directory. The idea will be to put all of the dotfiles into a folder called ~/.dotfiles.

In order to create the new directory, run the following command:

```bash
sudo mkdir ~/.dotfiles
```

Next will be to move any dotfiles to the `~/dotfiles` folder. For example, to copy an existing `.vimrc`, run the following command:

```bash
mv ~/.vimrc ~/dotfiles/vimrc
```

Once there's a bunch of dotfiles in this directory, the directory listing will likely look a lot like this:

```bash
ls -la ~/dotfiles
vimrc
zshrc
bashrc
```

### Install Script

**Update**: Do not use the below script. Leaving it for posterity, but there are better ways to backup dotfiles than with this script.

Since we want portability (the ability to use the dotfiles on any machine with Internet access), we’re going to need an install script. This script goes in our `~/dotfiles` directory.

```bash
#!/bin/bash
############################
# makesymlinks.sh
# This script creates symlinks from the home directory to any desired dotfiles in ~/dotfiles
############################

########## Variables

dir=~/.dotfiles                    # dotfiles directory
olddir=~/dotfiles_old             # old dotfiles backup directory
files="bashrc vimrc vim zshrc oh-my-zsh"    # list of files/folders to symlink in homedir

##########

# create dotfiles_old in homedir
echo "Creating $olddir for backup of any existing dotfiles in ~"
mkdir -p $olddir
echo "...done"

# change to the dotfiles directory
echo "Changing to the $dir directory"
cd $dir
echo "...done"

# move any existing dotfiles in homedir to dotfiles_old directory, then create symlinks
for file in $files; do
    echo "Moving any existing dotfiles from ~ to $olddir"
    mv ~/.$file ~/dotfiles_old/
    echo "Creating symlink to $file in home directory."
    ln -s $dir/$file ~/.$file
done
```

The commented sections in the above script explain it. First, the script cleans up any old symlinks that may exist in the Home directory and puts them into a folder called `dotfiles_old`. It then iterates through any files in the `~/.dotfiles` directory and it creates symlinks from the Home directory to these files. It handles naming these symlinks and prepending a dot to their filename, if needed.

### Creating a Local Git Repo

In order to push these files to GitHub, I'll need to initiate a new Git repo.

To make our `~/dotfiles` directory a Git repo, we simply change to it, and run the `git init` command:

```bash
cd ~/dotfiles
git init
```

Once the new Git repo has been initialized, start to track any files that should be part of the repo by using the `git add` command on them:

```bash
git add makesymlinks.sh
git add vimrc

# To add the entire directory to git
git add .
```

At this point, the dotfiles can be committed using the following command:

```bash
git commit -m '<some text>'
```

What’s important to realize is that this commit is local — nothing has actually been uploaded to GitHub. In fact, this can't be done until the local repository knows *where* the public GitHub repository actually resides. To do this, use `git remote add origin`, like so:

```bash
git remote add origin git@github.com:mygithubusername/dotfiles.git
```

Adding the origin only needs to be done once if using the same git repo. Otherwise, it will need to be done for each git repo.

Finally, the changes can be **pushed** to GitHub:

```bash
git push origin master

#Once the branch has been determined:
git push
```

### Issues

The following is an issue I received when trying to push to the new git repo. The following is an excerpt from a [post on GitHub](https://gist.github.com/adamjohnson/5682757) that states how to properly resolve this issue.

#### "Help, I keep getting a 'Permission Denied (publickey)' error when I push!"

This means, on your local machine, you haven't made any SSH keys. Not to worry. Here's how to fix:

1. Open git bash (Use the Windows search. To find it, type "git bash") or the Mac Terminal. **Pro Tip:** You can use any `*nix` based command prompt (but *not* the default Windows Command Prompt!)
2. Type `cd ~/.ssh`. This will take you to the root directory for Git (Likely `C:\Users[YOUR-USER-NAME]\.ssh\` on Windows)
3. Within the `.ssh` folder, there should be these two files: `id_rsa` and `id_rsa.pub`. These are the files that tell your computer how to communicate with GitHub, BitBucket, or any other Git based service. Type `ls` to see a directory listing. If those two files don't show up, proceed to the next step. **NOTE:** Your SSH keys must be named `id_rsa` and `id_rsa.pub` in order for Git, GitHub, and BitBucket to recognize them by default.
4. To create the SSH keys, type `ssh-keygen -t rsa -C "your_email@example.com"`. This will create both `id_rsa` and `id_rsa.pub` files.
5. Now, go and open `id_rsa.pub` in your favorite text editor (you can do this via Windows Explorer or the OSX Finder if you like, typing `open .` will open the folder).
6. Copy the contents--exactly as it appears, with no extra spaces or lines--of `id_rsa.pub` and paste it into GitHub and/or BitBucket under the Account Settings &gt; SSH Keys. **NOTE:** I like to give the SSH key a descriptive name, usually with the name of the workstation I'm on along with the date.
7. Now that you've added your public key to Github and/or BitBucket, try to `git push` again and see if it works. It should!

### References

* [http://blog.smalleycreative.com/tutorials/using-git-and-github-to-manage-your-dotfiles/](http://blog.smalleycreative.com/tutorials/using-git-and-github-to-manage-your-dotfiles/)
* [https://gist.github.com/adamjohnson/5682757](https://gist.github.com/adamjohnson/5682757)
* [https://www.atlassian.com/git/tutorials/dotfiles](https://www.atlassian.com/git/tutorials/dotfiles)


