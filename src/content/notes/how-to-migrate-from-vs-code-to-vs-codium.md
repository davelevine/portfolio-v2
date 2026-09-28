---
title: "How to Migrate From VS Code to VS Codium"
date: "2021-05-08T23:40:53-04:00"
description: "This article will discuss how to migrate from VS Code to VS Codium and retain all of the settings and extensions after making the switch."
topics:
  - vscode
ail: 0
---
This article will discuss how to migrate from VS Code to VS Codium and retain all of the settings and extensions after making the switch.

## Migrating from Visual Studio Code to VSCodium

VSCodium (and a freshly cloned copy of vscode built from source) stores its extension files in `~/.vscode-oss`. So if you currently have Visual Studio Code installed, your extensions won't automatically populate. You can reinstall your extensions from the Marketplace in VSCodium, or copy the extensions from `~/.vscode/extensions` to `~/.vscode-oss/`extensions.

Visual Studio Code stores its keybindings.json and settings.json file in these locations:

* Windows: `%APPDATA%\Code\User`  
* macOS: `$HOME/Library/Application Support/Code/User`  
* Linux: `$HOME/.config/Code/User`  

You can copy these files to the VSCodium user settings folder:

* Windows: `%APPDATA%\VSCodium\User`
* macOS: `$HOME/Library/Application Support/VSCodium/User`
* Linux: `$HOME/.config/VSCodium/User`

To copy your settings manually:

* In Visual Studio Code, go to **Settings** (Command+, if on a Mac)
* Click the three dots ... and choose `Open settings.json`
* Copy the contents of settings.json into the same place in VSCodium

## Resources

* <https://github.com/VSCodium/vscodium/blob/master/DOCS.md#migrating>
* <https://dev.to/0xdonut/why-and-how-you-should-to-migrate-from-visual-studio-code-to-vscodium-j7d>


