# Fonts

The brand (`</Dave Levine>`) and code use **Monaspace Xenon** v1.400 by GitHub
(SIL Open Font License 1.1; licence in `OFL-MonaspaceXenon.txt`), a slab-serif
monospace whose serifs echo the site's serif headings. Everything else uses
system fonts: serif for headings and sans for body text and labels.

Both files here are trimmed copies of `Monaspace Xenon Var.woff2` from the
[`monaspace-webfont-variable`](https://github.com/githubnext/monaspace/releases)
release asset. The licence reserves the name "Monaspace" (and "Xenon") for the
original, so the copies drop the family and style names and are loaded as
"Brand Mono" and "Code Mono". They keep the copyright and licence notices.

| Face | Where | Contents |
|---|---|---|
| Brand Mono | base64 WOFF2 inlined in `src/styles/globals.css` | weight 500, glyphs ` /<>DLaeinv` (~1 KB) |
| Code Mono | `code-mono.woff2`, bundled by Vite | variable weight 400–700, Latin (~26 KB) |

Code blocks use weight 450 (inline code 400, matching body text) and `font-feature-settings: "cv01" 2`, the slashed zero (the
default zero is close to `O`). Xenon's `calt` only does texture healing, not
symbol ligatures, so ligatures stay on.

To regenerate (Python with `fonttools` and `brotli`), e.g. if the brand text changes:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
import io, base64

SRC = 'Monaspace Xenon Var.woff2'
KEEP = {2, 7, 13, 14}  # subfamily, copyright notice (ID 7 in the source), licence

def build(axes, unicodes, feats):
    # recalcTimestamp=False keeps the source's timestamp, so output is byte-for-byte reproducible
    f = instancer.instantiateVariableFont(TTFont(SRC, lazy=False, recalcTimestamp=False), axes)
    b = io.BytesIO(); f.save(b); b.seek(0); f = TTFont(b, lazy=False, recalcTimestamp=False)
    o = subset.Options(); o.flavor = 'woff2'; o.layout_features = feats; o.name_IDs = ['*']
    s = subset.Subsetter(o); s.populate(unicodes=unicodes); s.subset(f)
    axis_ids = {a.axisNameID for a in f['fvar'].axes} if 'fvar' in f else set()
    if 'fvar' in f: f['fvar'].instances = []  # named styles carry the reserved name
    if 'STAT' in f: del f['STAT']
    f['name'].names = [r for r in f['name'].names if r.nameID in KEEP | axis_ids]
    f.flavor = 'woff2'; out = io.BytesIO(); f.save(out); return out.getvalue()

LATIN = [*range(0x20, 0x7F), *range(0xA0, 0x100), 0x2013, 0x2014, 0x2018, 0x2019,
         0x201C, 0x201D, 0x2022, 0x2026, 0x2190, 0x2192, 0x20AC, 0x2122]
open('code-mono.woff2', 'wb').write(
    build({'wdth': 100, 'slnt': 0, 'wght': (400, 700)}, LATIN,
          ['calt', 'cv01', 'kern', 'ccmp', 'locl', 'mark', 'mkmk']))
brand = build({'wdth': 100, 'slnt': 0, 'wght': 500}, [ord(c) for c in set('</Dave Levine>')], [])
print(base64.b64encode(brand).decode())  # paste into the "Brand Mono" @font-face
```
