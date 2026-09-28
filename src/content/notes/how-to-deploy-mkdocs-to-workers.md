---
title: "How to Deploy MkDocs Material to Cloudflare Workers"
date: "2022-01-09T21:41:51-05:00"
description: "This article will detail how to deploy MkDocs Material to Cloudflare Workers with Wrangler and GitHub Actions."
topics:
  - mkdocs
  - cloudflare
  - workers
ail: 0
---
This article will detail how to deploy MkDocs Material to Cloudflare Workers with Wrangler and GitHub Actions.

## Background

This is something that I've had deployed using Cloudflare Pages for some time now, but due to the [build image] currently being used for Cloudflare Pages, certain plugins are unsupported and error prone when deploying, namely `git-revision-date-localized`. This plugin adds support for adding a localized update and creation date at the bottom of each page. It's incredibly useful, but when deploying it through Cloudflare Pages, the build always fails.

While searching for a solution to this, I found the [MkDocs wiki] which has a page particularly listing all potential avenues for deployment. Seeing Cloudflare Workers on it and having already built a [URL shortener] with it, I decided to give it a try.

[build image]: https://www.starfallprojects.co.uk/projects/deploy-host-docs/deploy-mkdocs-material-cloudflare/#site-setup
[MkDocs wiki]: https://github.com/mkdocs/mkdocs/wiki/Mkdocs-Deployments
[URL shortener]: https://github.com/davelevine/atomic-url

## Setup

In order to leverage Wrangler to build MkDocs Material, we first need to install Wrangler.

```bash
cd ~
npm i @cloudflare/wrangler -g
```

This will install Wrangler using `npm` in the home directory. Once Wrangler has finished installing, it can be found at `~/.wrangler`.

Once in the `~/.wrangler/bin` directory, we'll need to connect it to Cloudflare by leveraging their API. Instructions for this can be found in the [Workers documentation].

After leveraging the Cloudflare API, use the following to connect Wrangler to the Cloudflare account...

```bash
./wrangler login
```

The command will ask to open a browser window to login. Open the window and allow the connection.

Once the connection has been allowed, make a symlink to the `docs` repo.

`sudo ln -s ~/Downloads/GitHub/docs/ ~/.wrangler/bin/docs`

While still in the `docs` directory, initialize the repo to make use of Wrangler with the following command...

```bash
./wrangler init docs
```

This will create a `wrangler.toml` file within the repo directory. Open the directory and modify `wrangler.toml`.

```bash
cd docs
sudo nano wrangler.toml
```

Values to be modified are as follows...

* account_id
* kv_namespaces
* zone_id

> **Note**
>
> The `account_id` and `zone_id` can be found in the Overview section of the domain being used for MkDocs. The values for `kv_namespaces` will be created later.

The following is the finalized version of the `wrangler.toml` file that currently works with Workers.

```yml

name = "docs-turtle-ocelot"
type = "webpack"

account_id = "<id>"
compatibility_date = "2022-01-09"
kv_namespaces = [
  {binding = "__docs-turtle-ocelot-workers_sites_assets", id = "<id>"},
]
route = ""
workers_dev = true
zone_id = "<id>"

[site]
bucket = "./site" 

[dev]
ip = "0.0.0.0"
local_protocol = "http"
port = 8787
upstream_protocol = "https"

```

[Workers documentation]: https://developers.cloudflare.com/workers/get-started/guide#7-configure-your-project-for-deployment

## Create KV Namespaces

In order to create `kv_namespaces`, use the following Wrangler commands in the `~/.wrangler/bin` directory...

```bash
./wrangler kv:namespace create "__docs-turtle-ocelot-workers_sites_assets"
```

This will create the required KV namespace and bindings needed for MkDocs to store articles. The output from the commands should be added to the `wrangler.toml` file as shown above.

Once `wrangler.toml` has been modified, navigate back to the `~/.wrangler/bin` directory. Copy the `Wrangler` file to the git repo.

```bash
cd ~/.wrangler/bin
sudo cp wrangler docs
```

## Publish to Workers

Navigate back into the MkDocs git repo and test the project locally.

```bash
cd ~/.wrangler/bin/docs
./wrangler dev
```

This will cause `npm` to download and install the dependencies and packages needed. It will also run a live web server to access the project locally, which will listen on <http://0.0.0.0:8787>.

Open the URL with <http://127.0.0.1/8787> and confirm the project appears as it should.

Once confirmed, at this point, the project can be published to Cloudflare Workers by running the `./wrangler publish` command within the git repo.

Once published, the output of the command should be as follows...

```bash
✨  Built successfully, built project size is 13 KiB.
✨  Successfully published your script to
 https://docs.<subdomain>.workers.dev
```

## Using a Custom Domain

Currently, MkDocs will only work with the above URL. In order to change this, a route will need to be configured in the `Workers` section of the domain on Cloudflare. I'm currently using <https://docs.levine.org> for this.

* Open Cloudflare and the `levine.org` domain
* Navigate to **Workers**
* Add a route
* The **Route** should be `*.levine.org/*` and the **Service** should be `docs-turtle-ocelot` with the **Environment** set to `Production`.

At this point, MkDocs should now be accessible at <https://docs.levine.org>.

## GitHub Actions

All of the aforementioned information only accounts for allowing the site to be published to Workers. It doesn't account for anything prior to it such as rebuilding the site. In order to automate it so that each commit will automatically rebuild the site, install all dependencies and deploy the site to Workers, we're going to leverage [GitHub Actions].

First, add a workflow file: `.github/workflows/main.yml` that contains the build and deploy instructions.

```yml

name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: "recursive" 
          fetch-depth: 0       # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Python
        uses: actions/setup-python@v1
        with:
          python-version: '3.10.1'

      - name: Install dependencies
        run: |
          python3 -m pip install --upgrade pip     # install pip
          python3 -m pip install mkdocs            # install mkdocs 
          python3 -m pip install mkdocs-material   # install material theme
          python3 -m pip install mkdocs-git-revision-date-localized-plugin
          python3 -m pip install -r requirements.txt

      - name: Build site
        run: mkdocs build

      - name: Deploy to Cloudflare Workers with Wrangler
        uses: cloudflare/wrangler-action@1.2.0
        with:
          publish_dir: site
          apiKey: ${{ secrets.CF_API_KEY }}
          email: ${{ secrets.CF_EMAIL }}

```

Before deploying, it's important to note that the `apiKey` and `email` should first be added to the `docs` repo `Secrets` section.

* Open [Docs]
* Open `Settings` and click `Secrets`
* Click `New repository secret`
* Start with `apiKey` and name it `CF_API_KEY`, then add the Cloudflare `Global API Key`.
* Repeat the same steps for `email` using the email address for Cloudflare.

Push a commit and watch GitHub Actions do the rest. Commit a change to the documentation to double check that the site builds properly.

[GitHub Actions]: https://github.com/features/actions
[Docs]: https://github.com/davelevine/docs

## References

* <https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler>
* <https://github.com/marketplace/actions/clone-github-repo-action>
* <https://bluegenes.github.io/mkdocs-github-actions/>
* <https://medium.com/swlh/using-cloudflare-workers-and-github-actions-to-deploy-statically-generated-sites-c96b502d49c4>
* <https://betterprogramming.pub/build-a-blog-with-github-and-mkdocs-cf47914affa7>
* <https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions>
* <https://www.pinel.cc/blog/2019/11/02/private-github-actions>
* <https://github.com/cloudflare/wrangler#installation>
* <https://developers.cloudflare.com/workers/runtime-apis/kv>


