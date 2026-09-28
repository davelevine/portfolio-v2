---
title: "How to Fix Flash of Unstyled Text (FOUT)"
date: "2022-06-22T18:16:57-04:00"
description: "When I first started using a custom font with Material for MkDocs, I noticed that anytime the page would load without the font being cached, there would be a brief flash of unstyled text (FOUT).^1"
topics:
  - css
  - mkdocs
ail: 0
---
When I first started using a [custom font](https://squidfunk.github.io/mkdocs-material/setup/changing-the-fonts/#customization) with Material for MkDocs, I noticed that anytime the page would load without the font being cached, there would be a brief flash of unstyled text (FOUT).[^1]

[^1]: This issue can happen with any web application that makes use of CSS.

This means that my text would be displayed without the correct font. It would restyle shortly after, displaying the correct font once everything finished loading.(1) This is problematic when working with custom fonts because it's distracting to the end user and in my opinion, gives an unprofessional feel to the site.

[^1]: While this issue is hardly specific to Material for MkDocs, I've only encountered the issue specifically with Material for MkDocs, which is why the article is listed in this section.

After doing some digging, I found that the reason for this is due to the way the font is displayed within its respective CSS file.

## The Problem

By default, Material for MkDocs integrates directly with [Google Fonts](https://fonts.google.com) and makes it particularly easy to utilize whichever font you'd like, as long as it's within Google Fonts. Material for MkDocs does natively allow you to use custom fonts, although there's a bit more effort on your part to get it working properly. This is by way of adding an [additional style sheet](https://squidfunk.github.io/mkdocs-material/setup/changing-the-fonts/#additional-fonts).

The example provided in the source documentation provides a basic skeleton for the required CSS, although if you're like me and you don't work with CSS enough, it's easy to get tripped up if you're not careful.

**docs/stylesheets/extra.css**

``` css
@font-face {
  font-family: "<font>";
  src: "...";
}
```

**mkdocs.yml**

``` yaml
extra_css:
  - stylesheets/extra.css
```

Making use of this example, I came up with the following CSS for my custom font...

**docs/stylesheets/extra.css**

```css
@font-face {
font-family: 'DomaineText-Regular';
src: url('../assets/webFonts/domaine-text-regular.woff2') format('woff2');
font-weight: 400;
font-style: normal;
font-display: swap; /* Line causing FOUT */
}
```

Using `font-display: swap` is great when it comes to performance, but since I already use Cloudflare for caching, performance is not paramount.

I found a [blog post](https://codebycorey.com/blog/defeating-flash-of-unstyled-text-fout) that gave a really solid explanation of the issue...

> I noticed the `@font-face` styles were using `font-display: swap;`. When `swap` is set, the browser will give a very short time to load the font before it uses a fallback. Once the font is fully loaded, it will convert back to the expected font. This option is great from a performance standpoint but might affect user experience. If you set `font-display: block`, this will increase the amount of time the browser will have to fetch your fonts before it starts displaying anything on the page. `block` sacrifices performance for user experience.

## The Solution

By changing `font-display: swap` to `font-display: block`, it allowed the font a bit more time to load before anything is displayed. Becuase I utilize Cloudflare with adequite caching, this isn't terribly problemtic, but once the cache clears and the font is pulled from the origin again, it will be noticeable without changing the way the font is displayed.

The new CSS syntax should now look like the following...

**docs/stylesheets/extra.css**

```css
@font-face {
font-family: 'DomaineText-Regular';
src: url('../assets/webFonts/domaine-text-regular.woff2') format('woff2');
font-weight: 400;
font-style: normal;
font-display: block; /* No longer causing FOUT */
}
```

## References

* <https://codebycorey.com/blog/defeating-flash-of-unstyled-text-fout>
* <https://squidfunk.github.io/mkdocs-material/setup/changing-the-fonts/#additional-fonts>

