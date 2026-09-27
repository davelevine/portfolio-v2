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

Everything else uses system fonts: serif for headings, sans for body text and
labels, and system monospace for code (IBM Plex Mono if it's installed locally).
