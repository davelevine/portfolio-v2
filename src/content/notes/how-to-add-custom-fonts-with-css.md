---
title: "How to Add Custom Fonts with CSS"
date: "2021-05-23T00:19:41-04:00"
description: "This article will explain how to serve custom fonts to my blog and MkDocs. This is largely documented in an article on how to style my blog, although I'm going to add a bit more to it at the end."
topics:
  - css
  - mkdocs
ail: 0
---
This article will explain how to serve custom fonts to my blog and MkDocs. This is largely documented in an article on how to style my blog, although I'm going to add a bit more to it at the end.

### Files to Modify

In order to update aspects of the theme, the following files need to be modified:

* **_base.scss**
* **_variables.scss**

#### Font

Fonts must first be imported into the `_base.scss` file. This can be done by adding the following to the top of the `_base.scss` file:

```css
@import url("https://fonts.gstatic.com");
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif&family=Lora&display=swap');
```

* Navigate to `themes -> hugo-coder -> assets -> scss`
* Open **_variables.scss**
* Update `$font-family:`

#### Additional Options

Additionally, fonts can be added directly by using the `@font-face` CSS rule. For my blog, this is done as follows:

```css
@font-face {
  font-family: 'DomaineText-Regular';
  src: url('../fonts/domaine-text-web-regular.eot');
  src: url('../fonts/domaine-text-web-regular.eot?#iefix') format('embedded-opentype'),
       url('../fonts/domaine-text-web-regular.woff') format('woff'),
       url('../fonts/domaine-text-web-regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

This references the appropriate font(s) and each file's relative path.

Another way to do this is to upload the font files to a server and reference the web address instead of the relative path. An example of this is how I serve the 'DomaineText-Regular' font to Bookstack...

```css
@font-face {
  font-family: 'DomaineText-Regular';
  src: url('/fonts/domaine-text-web-regular.eot');
  src: url('/fonts/domaine-text-web-regular.eot?#iefix') format('embedded-opentype'),
       url('/fonts/domaine-text-web-regular.woff') format('woff'),
       url('/fonts/domaine-text-web-regular.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

## MkDocs

To serve web fonts in MkDocs, the following steps should be taken...

* Copy the web font files to `theme -> assets -> webFonts`
* Add the CSS file to `theme -> assets`
* Open `mkdocs.yml`
* Reference the `font-family` name under `font -> text` (ex. DomaineText-Regular).
* Copy the relative path of the CSS file and add it to the `extra_css` section.

The respective sections in the `mkdocs.yml` file should look like the following:

```yml
  font:
    text: DomaineText-Regular
    code: Ligalex-Mono
```

```yml
extra_css:
  - assets/extra-75bc45e106.css
  - assets/domaine-text-font.css
  - assets/ligalex-mono-font.css
```

## References

<https://www.pagecloud.com/blog/how-to-add-custom-fonts-to-any-website>


