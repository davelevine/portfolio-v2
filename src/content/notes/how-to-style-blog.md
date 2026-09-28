---
title: "How to Update Blog"
date: "2021-05-14T22:57:43-04:00"
description: "This will be a quick article on how to update aspects of the theme such as the font and colors."
topics:
  - hugo
  - css
ail: 0
---
This will be a quick article on how to update aspects of the theme such as the font and colors.

## How to Update

In order to update aspects of the theme, the following files need to be modified:

* **_base.scss**
* **_variables.scss**

### Font

Fonts must first be imported into the `_base.scss` file. This can be done by adding the following to the top of the `_base.scss` file:

```css
@import url("https://fonts.gstatic.com");
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif&family=Lora&display=swap');
```

* Navigate to `themes -> hugo-coder -> assets -> scss`
* Open **_variables.scss**
* Update `$font-family:`

### Colors

* Navigate to `themes -> hugo-coder -> assets -> scss`
* Open `_variables.scss`

Update the following:

* **$bg-color-dark**
* **$fg-color-dark**
* **$link-color-dark**

### Remove Hyphens

* Navigate to `themes -> hugo-coder -> assets -> scss`
* Open **_content.scss**
* Change `hyphens` from **auto** to **none** in the following block:

```css
{
      text-align: justify;
      text-justify: auto;
      hyphens: none;
    }
```

## References

* <https://github.com/luizdepra/hugo-coder/commit/fb2dc89b45b4ba61f6d66cca4c8f3062b4e94314>
* <https://github.com/luizdepra/hugo-coder/pull/496#issuecomment-787417973>


