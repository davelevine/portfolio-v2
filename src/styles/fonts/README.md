# Fonts

The brand (`</Dave Levine>`) uses an embedded subset of **JetBrains Mono SemiBold**
(v2.304, SIL Open Font License 1.1; license in `OFL-JetBrainsMono.txt`). It is
inlined as a base64 WOFF2 `@font-face` ("Brand Mono") in `src/styles/globals.scss`
and contains only the glyphs ` /<>DLaeinv`.

If the brand text changes, regenerate it (Python with `fonttools` and `brotli`):

```python
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
import base64
f = instancer.instantiateVariableFont(TTFont('JetBrainsMono[wght].ttf'), {'wght': 600})
o = subset.Options(); o.flavor = 'woff2'; o.layout_features = []; o.name_IDs = []
s = subset.Subsetter(o); s.populate(unicodes=[ord(c) for c in set('</Dave Levine>')]); s.subset(f)
f.flavor = 'woff2'; f.save('brand-mono.woff2')
print(base64.b64encode(open('brand-mono.woff2', 'rb').read()).decode())
```

Everything else uses system fonts: serif for headings, sans for body text and
labels, and system monospace for code.
