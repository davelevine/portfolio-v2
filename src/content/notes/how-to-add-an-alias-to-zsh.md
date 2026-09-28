---
title: "How to Add an Alias to Zsh"
date: "2021-03-06T17:58:31+00:00"
description: "I'm adding this article here because I'm using Zsh in Manjaro, but this could apply to any \\*nix system."
topics:
  - linux
  - zsh
ail: 0
---
I'm adding this article here because I'm using Zsh in Manjaro, but this could apply to any *nix system.

### Adding an Alias

When adding an alias, it needs to be added to the shell configuration file; in this case, it would be `~/.zshrc`.

Open the configuration file with Nano

```bash
sudo nano ~/.zshrc
```

In my case, there was already a section at the very bottom of the configuration file for aliases. If not, it can just be noted like the following:

```bash
# Aliases

alias ls="ls -la"
alias lst="exa --tree"
```

These are currently the two aliases I have running through Zsh. The syntax for adding aliases is listed below:

* 'ls' denotes the alias you'd like to use to alias the command "ls -la".
* 'lst' denotes the alias you'd like to use to alias the command "exa --tree"

Save the `.zshrc` file and reload the shell with the following command:

```bash
source ~/.zshrc
```

> **Tip**
>
> This process is nearly the same on MacOS, although the command should be written in single quotes, not double...

ex: alias ls='ls -lsa'

### References

* [https://www.tecmint.com/create-alias-in-linux/](https://www.tecmint.com/create-alias-in-linux/)
* [https://coolestguidesontheplanet.com/make-an-alias-in-bash-shell-in-os-x-terminal/](https://coolestguidesontheplanet.com/make-an-alias-in-bash-shell-in-os-x-terminal/)


