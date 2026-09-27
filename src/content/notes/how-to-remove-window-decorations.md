---
title: "How to Remove Window Decorations"
date: "2021-03-06T19:14:13+00:00"
description: "This article will explain how to go about disabling window decorations for all applications in Openbox."
topics:
  - manjaro
  - openbox
ail: 0
---
This article will explain how to go about disabling window decorations for all applications in Openbox.

### Removing Decorations

Window decorations are also known as the top border around all application windows. To create a more minimalistic workspace, I prefer to turn these borders off.

There is a key binding that will allow these decorations to be turned on and off at will, but this article will focus on a more permanent approach. For reference, the key binding is **Alt + D**.

In order to remove window decorations in a more permanent fashion, the **rc.xml** file will need some syntax added to it.

The **rc.xml** file is located in **~/.config/openbox/rc.xml**.

Open a Terminal and use Nano to open the file:

`nano ~/.config/openbox/rc.xml`

Scroll down to the bottom of the file and insert the following above the last line:

`<applications>
<application class="*">
<decor>no</decor>
</application>
</applications>`

Make sure the above snippet is inserted after the previous **&lt;/applications&gt;** line, but before the **&lt;/openbox_config&gt;** line.

Reload Openbox by using the **Alt + Shift + R** key binding.

### Alternative Method

There is a slight alternative to the above method that forces all new windows to open maximized. The syntax is as follows:

`<applications>
<application class="*">
<maximized>true</maximized>
<decor>no</decor>
</application>
</applications>`

Note the addition of the third line that says **&lt;maximized&gt;true&lt;/maximized&gt;**

This has a negative affect on **Conky-Manager**, as it forces the Conky widget to only display in the top-left corner. Adjusting the X and Y axis values does not have any affect when this line is in place. Removing the line and reloading Openbox will prevent this from happening. If **Conky-Manager** is not running, this will likely not be an issue.

### Resources

[https://forum.manjaro.org/t/in-need-of-a-simple-on-off-method-for-windows-decorations/30578/6](https://forum.manjaro.org/t/in-need-of-a-simple-on-off-method-for-windows-decorations/30578/6)


