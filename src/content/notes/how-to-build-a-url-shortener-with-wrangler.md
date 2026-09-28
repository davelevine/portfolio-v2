---
title: "How to Build a URL Shortener with Cloudflare Workers"
date: "2021-12-29T14:55:04-05:00"
description: "This article will serve as a step-by-step guide for creating a URL shortener with Cloudflare Workers. The project is effectively a fork of Atomic URL by Jerry Ng, although I've heavily modified it to suit my needs. The source can be found here."
topics:
  - cloudflare
  - workers
ail: 0
---
This article will serve as a step-by-step guide for creating a [URL shortener](https://github.com/davelevine/atomic-url) with Cloudflare Workers. The project is effectively a fork of Atomic URL by Jerry Ng, although I've heavily modified it to suit my needs. The source can be found [here](https://github.com/ngshiheng/atomic-url).

In addition to leveraging Cloudflare Workers, this project will also leverage the following...

* [Wrangler](https://github.com/cloudflare/wrangler) (the CLI for working with Workers)
* [Workers KV](https://www.cloudflare.com/products/workers-kv/) (database storage for Workers)

## Setup

In order to leverage Wrangler to build the URL shortener (from here out known as Atomic URL), we first need to install Wrangler.

```bash
cd ~
npm i @cloudflare/wrangler -g
```

This will install Wrangler using `npm` in the home directory. Once Wrangler has finished installing, it can be found at `~/.wrangler`.

Once in the `~/.wrangler/bin` directory, we'll need to connect it to Cloudflare by leveraging their API. Instructions for this can be found in the [Workers documentation](https://developers.cloudflare.com/workers/get-started/guide#7-configure-your-project-for-deployment).

After leveraging the Cloudflare API, use the following to connect Wrangler to the Cloudflare account...

```bash
./wrangler login
```

The command will ask to open a browser window to login. Open the window and allow the connection.

Once the connection has been allowed, clone the git repo for Atomic URL.

`git clone https://github.com/davelevine/atomic-url.git`

While still in the `~/.wrangler/bin` directory, initialize the repo to make use of Wrangler with the following command...

```bash
./wrangler init atomic-url
```

This will create a `wrangler.toml` file within the repo directory. Open the directory and modify `wrangler.toml`.

```bash
cd atomic-url
sudo nano wrangler.toml
```

Values to be modified are as follows...

* account_id
* kv_namespaces
* zone_id

> **Note**
>
> The `account_id` and `zone_id` can be found in the Overview section of the domain being used for Atomic URL. The values for `kv_namespaces` will be created later.

The following is the finalized version of the `wrangler.toml` file that currently works with Workers.

```yml

name = "atomic-url"
type = "webpack"

account_id = "<id>"
compatibility_date = "2021-12-29"
kv_namespaces = [
  {binding = "URL_DB", id = "<id>", preview_id = "<id>"},
]
route = ""
workers_dev = true
zone_id = "<id>"

[dev]
ip = "0.0.0.0"
local_protocol = "http"
port = 8787
upstream_protocol = "https"

```

## Create KV Namespaces

In order to create `kv_namespaces`, use the following Wrangler commands in the `~/.wrangler/bin` directory...

```bash
./wrangler kv:namespace create "URL_DB"
./wrangler kv:namespace create "URL_DB" --preview
```

This will create the required KV namespaces and bindings needed for Atomic URL to store URLs. The output from the commands should be added to the `wrangler.toml` file as shown above.

Once `wrangler.toml` has been modified, navigate back to the `~/.wrangler/bin` directory. Copy the `Wrangler` file to the git repo.

```bash
cd ~/.wrangler/bin
sudo cp wrangler atomic-url
```

## Expire URLs

To help secure the service from abuse, I've set the URLs to expire after a certain period of time. For now, the URLs will expire one day after creation.

In the [Workers KV docs](https://developers.cloudflare.com/workers/runtime-apis/kv#writing-key-value-pairs), there are two ways to accomplish this...

> **Quote**
>
> - Set its "expiration", using an absolute time specified in a number of seconds since the UNIX epoch. For example, if you wanted a key to expire at 12:00AM UTC on April 1, 2019, you would set the key’s expiration to 1554076800.
> - Set its "expiration TTL" (time to live), using a relative number of seconds from the current time. For example, if you wanted a key to expire 10 minutes after creating it, you would set its expiration TTL to 600.

For this particular use case, the "expiration TTL" is the appropriate way to approach this. To do this, a command needs to run from within the Worker...

```javascript
NAMESPACE.put(key, value, {expiration: secondsSinceEpoch})
```

Applying this to Atomic URL, modify the `createShortUrl.js` file to reference the Expiration TTL...

```javascript
event.waitUntil(URL_DB.put(urlKey, originalUrl, {expirationTtl: 86400}))
```

## Publish to Workers

Navigate back into the Atomic URL git repo and test the project locally.

```bash
cd ~/.wrangler/bin/atomic-url
./wrangler dev
```

This will cause `npm` to download and install the dependencies and packages needed. It will also run a live web server to access the project locally, which will listen on <http://0.0.0.0:8787>.

Open the URL with <http://127.0.0.1/8787> and confirm the project appears as it should.

Once confirmed, at this point, the project can be published to Cloudflare Workers by running the `./wrangler publish` command within the git repo.

Once published, the output of the command should be as follows...

```bash
✨  Built successfully, built project size is 4 KiB.
✨  Successfully published your script to
 https://atomic-url.davelevine.workers.dev
```

## Using a Custom Domain

Currently, Atomic URL will only work with the above URL. In order to change this, a route will need to be configured in the `Workers` section of the domain on Cloudflare. I'm currently using <https://dl.is> for this.

* Open Cloudflare and the `dl.is` domain
* Navigate to **Workers**
* Add a route
* The **Route** should be `dl.is/*` and the **Service** should be `atomic-url` with the **Environment** set to `Production`.

At this point, Atomic URL should now be accessible at <https://dl.is>.

## UI Modifications

The following modifications have been done for a cleaner UI, but are completely optional.

* Within the project directory, open the `constants.js` found in the `/src/utils` folder.
* Modify the file so it looks like the following...

<details>
<summary>constants.js</summary>

```html
export const ALPHABET =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const LANDING_PAGE_HTML = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Atomic URL</title>

        <!--Favicon-->
        <link rel="icon" type="image/x-icon" href="https://cdn.jsdelivr.net/gh/davelevine/url-shortener@main/atom-energy.png">

        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;700&display=swap" rel="stylesheet">
        
        <script src="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/js/all.min.js" crossorigin="anonymous"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.0/css/bulma.min.css" />

        <script>
            const submitURL = () => {
                let statusElement = document.getElementById('status')
                let originalUrlElement = document.getElementById('url')
            
                if (!originalUrlElement.reportValidity()) {
                    throw new Error('Invalid URL.')
                }
            
                statusElement.classList.add('is-loading')
            
                const originalUrl = originalUrlElement.value
                const body = JSON.stringify({ originalUrl })
            
                fetch('/api/url', { method: 'POST', body })
                    .then((data) => data.json())
                    .then((data) => {
                        statusElement.classList.remove('is-loading')
                        statusElement.innerHTML = data.shortUrl
                    })
            
                originalUrlElement.value = ''
            }
            
            const copyToClipboard = (elementId) => {
                var aux = document.createElement('input')
            
                aux.setAttribute('value', document.getElementById(elementId).innerHTML)
            
                document.body.appendChild(aux)
            
                aux.select()
            
                document.execCommand('copy')
            
                document.body.removeChild(aux)
            }
            
        </script>
    <script defer data-domain="dl.is" data-api="/data/api/event" src="/data/js/script.js"></script>
    </head>
    <body>
        <section class="container">
                            <h1 class="title is-1">Atomic URL</h1>
                            <h2 class="subtitle colored is-4">A URL shortener POC built using Cloudflare Workers.</h2>
               <!--
                            <p>Designing a URL shortener such as <a href="https://tinyurl.com/">TinyURL</a> and <a href="https://bitly.com/">Bitly</a> is one of the most common System Design interview questions in software engineering.</p>
                            </br>
                            <p>While meddling around with <a href="https://workers.cloudflare.com/">Cloudflare Worker</a>, it gave me an idea to build an actual URL shortener that can be used by anyone.</p>
                            </br>
               -->
                            <p>This is a proof of concept (POC) of how one builds an actual URL shortener service using serverless computing. The source code can be found <a href="https://github.com/davelevine/atomic-url">here</a>.</p>
                            <h1 class="title is-2">Shorten a URL</h1>
                                <span class="icon has-text-info">
                                <i class="fas fa-info-circle"></i>
                                </span>
                                <span class="description">Enter a valid URL to shorten</span>
                            </br>
                                    <input class="input is-link is-primary is-medium is-rounded" type="url" placeholder="https://example.com/" id="url" required>
                            <button id="submit" class="button is-block is-primary is-rounded is-fullwidth is-medium" onclick="submitURL()">Shorten</button>
                            <br />
                            <button class="button is-info is-rounded is-small" onclick="copyToClipboard('status')">
                            <span class="icon">
                            <i class="fas fa-copy"></i>
                            </span>
                            <span id="status" ></span>
                            </button>
                <!--
                    <br>
                    <nav class="level">
                            <small class="level-item" style="color: var(--textLight)">
                            &copy; Atomic URL originally created by &nbsp<a href="https://s.jerrynsh.com/">Jerry Ng</a>. All Rights Reserved.
                            </small>
                    </nav>
                -->
        </section>
    </body>
    <style>
        :root {
        --brandColor: hsl(166, 67%, 51%);
        --background: rgb(40, 42, 54);
        --textDark: hsl(231, 15%, 18%);
        --textLight: hsl(232, 14%, 31%);
        }
        body {
        background: var(--background);
        height: 100vh;
        width: 100vw;
        margin: 0px;
        padding: 0px;
        overflow-x: hidden;
        border: 1px solid transparent;
        color: var(--textDark);
        }
        .field:not(:last-child) {
        margin-bottom: 1rem;
        }
        .register {
        margin-top: 4rem;
        background: #f8f8f2;
        border-radius: 10px;
        }
        .left,
        .right {
        padding: 2.0rem;
        }
        .left {
        border-right: 5px solid var(--background);
        }
        .left .title {
        font-weight: 800;
        letter-spacing: -1px;
        }
        .left .colored {
        color: var(--brandColor);
        font-weight: 500;
        margin-top: 1rem !important;
        letter-spacing: -1px;
        }
        .left p {
        color: var(--textLight);
        font-size: 1.15rem;
        }
        .right .title {
        margin-top: 0.3rem;
        margin-bottom: 1rem !important;
        font-weight: 800;
        letter-spacing: -1px;
        }
        .right .description {
        margin-top: 1rem;
        margin-bottom: 1rem !important;
        color: var(--textLight);
        font-size: 1.15rem;
        }
        .right small {
        color: var(--textLight);
        }
        input {
        font-size: 1rem;
        }
        input:focus {
        border-color: var(--brandColor) !important;
        box-shadow: 0 0 0 1px var(--brandColor) !important;
        }
        .fab,
        .fas {
        color: var(--textLight);
        margin-right: 1rem;
        }
    </style>
</html>
`

export const URL_CACHE = 'apiCache'
```

</details>

* Re-run `./wrangler publish` to push the changes to Workers.
* Push the changes to GitHub.

## References

* <https://github.com/ngshiheng/atomic-url>
* <https://github.com/cloudflare/wrangler#installation>
* <https://developers.cloudflare.com/workers/runtime-apis/kv>


