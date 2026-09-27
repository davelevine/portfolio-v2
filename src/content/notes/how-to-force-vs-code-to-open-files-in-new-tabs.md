---
title: "How to Force VS Code to Open Files in New Tabs"
date: "2021-03-06T21:16:30+00:00"
description: "This will be a quick article able forcing VS Code to use tabs when opening files."
topics:
  - vscode
ail: 0
---
This will be a quick article able forcing VS Code to use tabs when opening files.

### Force VS Code to Use Tabs

By default, in Visual Studio Code, files open in the same tab. This is because of “Preview Mode” which is designed to allow you to quickly view files.

To stop files from going into preview mode, and always open a new tab go to File -&gt; Preferences -&gt; Settings (or Ctrl + ,)

And add the following to “Users Settings”

`"workbench.editor.enablePreview":` `false`

Make sure you include a comma if there’s other settings as it has to be valid json.

![vscode-open-files-in-new-tab.png](https://cdn.levine.io/uploads/images/gallery/2020-08/scaled-1680-/0kzR9Yt5pcJ9Tbe6-vscode-open-files-in-new-tab.png)

### Reference

[https://www.brcline.com/blog/force-vscode-open-files-new-tab](https://www.brcline.com/blog/force-vscode-open-files-new-tab)


