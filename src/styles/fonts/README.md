# Fonts

The brand (`</Dave Levine>`) uses a subset of **Pitch Regular** from
[Klim Type Foundry](https://klim.co.nz), loaded as the `@font-face` "Brand Mono" in
`src/styles/globals.css` and preloaded in `src/layouts/Layout.astro`. It contains
only the glyphs ` /<>DLaeinv`.

Pitch is commercial, under Klim's [web font licence](https://klim.co.nz/licences/web-fonts/)
for dave.levine.io. The licence requires reasonable measures against unlicensed
access and direct download, so **the font file must never be committed to this
public repo**, not even inlined as base64. It lives in the `levine` R2 bucket at
`uploads/portfolio/public/fonts/webfonts/pitch-brand.woff2`, served as
`https://cdn.levine.io/uploads/portfolio/public/fonts/webfonts/pitch-brand.woff2`. The
bucket's CORS policy (homelab-iac, `terraform/modules/cloudflare/data/r2_cors.yaml`)
lists which origins browsers let use it; `https://dave.levine.io` must stay in
that list.

The licence allows subsetting only to reduce file size, and only the WOFF2 format.
If the brand text changes, re-subset the licensed `pitch-regular.woff2` (Python with
`fonttools` and `brotli`), upload the result over the old object, and purge
cdn.levine.io's cache for that URL:

```python
from fontTools.ttLib import TTFont
from fontTools import subset
f = TTFont('pitch-regular.woff2')
o = subset.Options(); o.flavor = 'woff2'; o.layout_features = []; o.name_IDs = [0, 13, 14]
s = subset.Subsetter(o); s.populate(unicodes=[ord(c) for c in set('</Dave Levine>')]); s.subset(f)
f.save('pitch-brand.woff2')
```

`name_IDs = [0, 13, 14]` keeps Klim's copyright and licence notices in the file.

Local dev (`localhost`) isn't an allowed origin, so the brand falls back to system
monospace there.

Everything else uses system fonts: serif for headings, sans for body text and
labels, and system monospace for code.
