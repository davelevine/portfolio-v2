---
title: "How to Automatically Redirect to Privacy Focused Services"
date: "2021-05-23T22:00:37-04:00"
description: "This article will discuss how to use the Redirector Firefox extension to automatically redirect standard URLs to their privacy focused alternatives."
topics:
  - firefox
  - privacy
ail: 0
---
This article will discuss how to use the [Redirector](https://github.com/einaregilsson/Redirector) Firefox extension to automatically redirect standard URLs to their privacy focused alternatives.

## What is Redirector?

The following is taken from the Redirector [website](https://einaregilsson.com/redirector/)...

Redirector is a browser add-on for Firefox, Chrome, Edge and Opera. The add-on lets you create redirects for specific webpages, e.g. always redirect <http://bing.com> to <http://google.com>. It was originally done by request for someone on the Mozillazine forums. The redirect patterns can be specified using regular expressions or simple wildcards and the resulting url can use substitutions based on captures from the original url. The add-on can for example be used to redirect a site to its https version, redirect news paper articles to their print versions, redirect pages to use specific proxy servers and more.

## Examples

<details>
<summary>Twitter to Nitter</summary>

1. Description is optional but I use Twitter to nitter for understandability of Redirect.
2. Example URL can be any twitter URL.
3. Include pattern: <https://twitter.com/>*
4. Redirect to: <https://thoughtcrime.xyz/$1>
5. Pattern type: Wildcard
6. Pattern description is also optional.

</details>

<details>
<summary>YouTube to Invidious</summary>

1. Description is optional but I use YouTube to Invidious for understandability of Redirect.
2. Example URL can be any youtube URL.
3. Include pattern: <https://www.youtube.com/>*
4. Use any Invidious public instances. For now I use invidious.snopyta.org.
Redirect to: <https://invidious.snopyta.org/$1>
5. Pattern type: Wildcard
6. Pattern description is also optional.

</details>

<details>
<summary>Instagram to Bibliogram</summary>

1. Description is optional but I use Instagram to bibliogram for understandability of Redirect.
2. Example URL can be any instagram URL.
3. Include pattern: <https://www.instagram.com/>*
4. Redirect to: <https://bibliogram.art/u/$1>
5. Pattern type: Wildcard
6. Pattern description is also optional.

</details>

<details>
<summary>Reddit to Teddit</summary>

1. Description is optional but I use reddit to old reddit for understandability of Redirect.
2. Example URL can be any reddit URL.
3. Include pattern: <https://www.reddit.com/>*
4. Redirect to: <https://reddit.thoughtcrime.xyz/$1>
5. Pattern type: Wildcard
6. Pattern description is also optional.

</details>

<details>
<summary>Amazon to Amazon Smile</summary>

1. Description is optional, but will be used to redirect Amazon to Amazon Smile.
2. Example URL can be any Amazon URL.
3. Include pattern: <https://www.amazon.com/>*
4. Redirect to: <https://smile.amazon.com/$1>
5. Pattern type: Wildcard
6. Pattern description is also optional.

</details>

<details>
<summary>Bonus: Removal of annoying popup of signin/signup for viewing any question on Quora website</summary>

1. Description is optional but I use quora without annoying popup for understandability of Redirect.
2. Example URL can be any quora URL.
3. Include pattern: <https://www.quora.com/>*
4. Redirect to: <https://www.quora.com/$1?share=1>
5. Pattern type: Wildcard
6. Pattern description is also optional.
Here we need to something extra because above rules will cause this issue. Thanks to einaregilsson for helping me to solve that issue.
7. Click on Show advanced options.
8. Exclude pattern: <https://quora.com/*share=1>

</details>

## References

* <https://github.com/einaregilsson/Redirector>
* <https://einaregilsson.com/redirector/>
* <https://reddit.thoughtcrime.xyz/r/privacy/comments/jxrxnv/redirect_twitter_youtube_instagram_reddit_to/>


