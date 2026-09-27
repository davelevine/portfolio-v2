# Fonts

The brand (`</Dave Levine>`) uses an embedded subset of **IBM Plex Mono SemiBold**
(v2.005, SIL Open Font License 1.1; license in `OFL-IBMPlexMono.txt`). It is
inlined as a base64 WOFF2 `@font-face` ("Brand Mono") in `src/styles/globals.css`
and contains only the glyphs ` /<>DLaeinv`. The license reserves the name "Plex",
so the subset is published under a different family name.

If the brand text changes, regenerate it (Python with `fonttools` and `brotli`;
`IBMPlexMono-SemiBold.ttf` is in `packages/plex-mono/fonts/complete/ttf/` of
https://github.com/IBM/plex):

```python
from fontTools.ttLib import TTFont
from fontTools import subset
import base64
f = TTFont('IBMPlexMono-SemiBold.ttf')
o = subset.Options(); o.flavor = 'woff2'; o.layout_features = []; o.name_IDs = []
s = subset.Subsetter(o); s.populate(unicodes=[ord(c) for c in set('</Dave Levine>')]); s.subset(f)
f.flavor = 'woff2'; f.save('brand-mono.woff2')
print(base64.b64encode(open('brand-mono.woff2', 'rb').read()).decode())
```

## Code

Inline code and code blocks use **Pitch Regular** from
[Klim Type Foundry](https://klim.co.nz), as the `@font-face` "Code Mono" in
`src/styles/globals.css`, with system monospace as the fallback.

Pitch is commercial, under Klim's [web font licence](https://klim.co.nz/licences/web-fonts/)
for dave.levine.io. The licence requires reasonable measures against unlicensed
access and direct download, so **the font file must never be committed to this
public repo** (`*.woff2` is gitignored as a guard). The full, unmodified file lives
in the `levine` R2 bucket at `uploads/portfolio/public/fonts/webfonts/pitch-regular.woff2`,
served from `https://cdn.levine.io`. The bucket's CORS policy (homelab-iac,
`terraform/modules/cloudflare/data/r2_cors.yaml`) lists which origins browsers let
use it; `https://dave.levine.io` must stay in that list, and local dev only gets
Pitch from an origin that's listed there too.

Pitch has contextual alternates that turn `->` and `<-` into arrows, so code sets
`font-variant-ligatures: none`. It has no slashed or dotted zero; `0` and `O` rarely
share a token in this site's code, so that's accepted.

Everything else uses system fonts: serif for headings and sans for body text and
labels.
