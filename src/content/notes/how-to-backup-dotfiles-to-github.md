---
title: "How to Backup/Sync Dotfiles to Github"
date: "2022-03-08T11:49:53-05:00"
description: "One of the most important tasks to consider is making a backup of your dotfiles. While this is not a mandatory task, it makes life a lot easier, especially when it comes to things like working in multiple environments or disaster recovery."
topics:
  - git
  - github
  - cron
ail: 0
---
One of the most important tasks to consider is making a backup of your dotfiles. While this is not a mandatory task, it makes life a lot easier, especially when it comes to things like working in multiple environments or disaster recovery.

The problem is that depending on what you're doing, dotfiles can change often. Backing up something like dotfiles manually is not sustainable and can be easily automated. This article will take a practical and straightforward approach to doing just that.

> **Important**
>
> There is some overlap with a separate article I wrote last year. While that article isn't deprecated, this article assumes your dotfiles have already been organized. If they haven't, please reference the appropriate section in that article.

## Getting Started

In order to automate the process of backing up dotfiles, we're going to make use of a shell script. Before we do this, make sure your dotfiles are organized as needed. It's assumed that your dotfiles live in the $HOME directory, but you may not want to backup all of them.

In this example, I'm going to only backup the following...

> **Dots & Directories**
>
> * .zshrc
> * .bashrc
> * $HOME/.config/dunst
> * $HOME/.config/kitty
> * $HOME/.config/openbox
> * $HOME/.config/polybar
> * $HOME/.config/terminator
> * $HOME/.config/tint2

Depending on what you're backing up, modify that list accordingly.

## Creating the Script

> **Note**
>
> The following comes from an article on [dev.to](https://dev.to/jeffshomali/how-to-backup-sync-all-of-your-dotfiles-with-github-e1c) and was created by Jeff Shomali from Apple.

* Create a new Github repository on <https://github.com>.  
* In your local machine go to the desktop and open an empty folder in your terminal.
* Initiate an empty Git repository with `git init` and connect the local repo to your newly created repo with `git remote add git@github.com:yourusername/yourrepo.git`
* Create a shell script and name it whatever you want, like `backup.sh` and paste the following code into that file...

```bash
#!/bin/bash


# check to see is git command line installed in this machine
IS_GIT_AVAILABLE="$(git --version)"
if [[ $IS_GIT_AVAILABLE == *"version"* ]]; then
  echo "Git is Available"
else
  echo "Git is not installed"
  exit 1
fi


# copy other dot files
cp $HOME/.zshrc .
cp $HOME/.bashrc .

# copy directories
cp -r $HOME/.config/dunst .
cp -r $HOME/.config/kitty .
cp -r $HOME/.config/openbox .
cp -r $HOME/.config/polybar .
cp -r $HOME/.config/terminator .
cp -r $HOME/.config/tint2 .

# Check git status
gs="$(git status | grep -i "modified")"
# echo "${gs}"

# If there is a new change
if [[ $gs == *"modified"* ]]; then
  echo "push"
fi


# push to Github
git add .;
git commit -m "New backup `date +'%Y-%m-%d %H:%M:%S'`";
git push origin main
```

* Change the script permission with `chmod +x backup.sh`.
* Run the script with `$ ./backup.sh`

## Automating the Script

While everything above will get the script working properly, it still needs to be automated. The easiest way to do this is to make use of Cron. This will allow it to run in the background at a desired interval.

In order to set this up as a cronjob, do the following...

* Locate the path to your script, which should be within the local git folder created earlier
* Run `crontab -e`

My cronjob is set to run daily at 12pm, although this can be easily changed depending on your needs. If you need help with the cron syntax, check out [Crontab Guru](https://crontab.guru/).

Within the crontab window, your cronjob should look like the following...

```bash
0 12 * * * cd /home/dave/Downloads/GitHub/dotfiles/mabox && ./backup.sh
```

I've taken this a step further because I like knowing that my cronjobs actually run instead of having it silently fail. I prefer to leverage <https://healthchecks.io>, which is specifically designed to monitor cronjobs and other regularly running tasks.

> **Note**
>
> Setting up a check and an account at <https://healthchecks.io> is beyond the scope of this article, however, information on this can be found [here](https://healthchecks.io/docs/configuring_checks/).

Once a check has been configured, modify your cronjob so it looks like the following...

```bash
0 12 * * * cd /home/dave/Downloads/GitHub/dotfiles/mabox && ./backup.sh && curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/<uuid-slug>
```

## References

* <https://dev.to/jeffshomali/how-to-backup-sync-all-of-your-dotfiles-with-github-e1c>
* <https://crontab.guru>
* <https://healthchecks.io/docs/configuring_checks/>


