---
title: "Dracula Theme for MkDocs"
date: "2021-03-20T18:49:24-04:00"
description: "To implement Dracula theme, do the following:"
topics:
  - mkdocs
ail: 0
---
## Steps

To implement Dracula theme, do the following:

```bash
cd docs
mkdir theme
cd theme
mkdir assets
cd assets
```

Navigate to the [mkdocs_pymdownx_material_extras] repo and download the following files (1):

1. The filenames will likely be slightly different depending on when the files are accessed.

* extra-e384f43f0f.css
* extra-e384f43f0f.css.map
* extra-loader-5bb526e4.js
* extra-loader-5bb526e4.js.map
* material-extra-theme-7c147bb7.js
* material-extra-theme-7c147bb7.js.map

[mkdocs_pymdownx_material_extras]: https://github.com/facelessuser/mkdocs_pymdownx_material_extras/tree/master/mkdocs_pymdownx_material_extras/theme/assets/pymdownx-extras

 Replace the current fields in mkdocs.yml with the following:

```yaml
Theme:
    scheme: dracula
    primary: deep purple
    accent: deep purple
custom_dir: <theme root directory>
Plugins:
    - mkdocs_pymdownx_material_extras
```

Add `mkdocs_pymdownx_material_extras>=1.0` to `requirements.txt`

Run `mkdocs serve` to confirm the theme works. Once confirmed, run `git commit` to push to Cloudflare Pages (CI/CD).

## References

<https://github.com/facelessuser/mkdocs_pymdownx_material_extras>

<https://github.com/facelessuser/pymdown-extensions/pull/857#issuecomment-602085247>


