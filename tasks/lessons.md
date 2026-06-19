# Lessons

A perpetual running log of corrections and patterns. Never reset or archive.

## Debugging visual layout bugs — get ground truth before theorizing

**Context:** The `/projects` grid looked "off-balanced — one column larger." It took
far too many round-trips to find the cause (the Journalistic card has 8 tech logos;
its `.card .techLogos` flex row had no `flex-wrap`, so it formed one ~350px unbreakable
row that overflowed/blew out the card).

**What went wrong:**
- Reasoned from the CSS source ("`minmax(0,1fr)` → tracks are equal → boxes must be
  uniform") and kept proposing fixes (grid tracks, scale animation, `width:100%`,
  image `object-fit`) without confirming what the browser actually rendered.
- Treated equal *boxes* in the debug-outline screenshot as "fixed," missing that the
  defect was card **content overflowing** the (correctly-sized) box.
- Never looked at per-card *data* (tech counts) until the user was furious, even though
  the original symptom ("one column larger") is the classic signature of one item's
  min-content (an unwrapped flex row) being wider than the others.

**How to apply next time:**
1. For any "looks wrong" visual bug, get visual ground truth FAST. Either ask the user
   for a screenshot (don't fight them on how), or add a temporary debug overlay
   (`outline` on the suspect boxes) — do this in the FIRST pass, not the fifth.
2. Equal grid tracks do NOT guarantee uniform appearance. Check whether content
   OVERFLOWS the box (unwrapped flex rows, long tokens, fixed-size children). `outline`
   shows the box; the spilling content shows the real defect.
3. When a symptom is "one item/column is different," inspect that item's DATA and
   min-content drivers early (counts, longest string, fixed-width children), not just
   the shared CSS.
4. Don't declare "fixed" from a screenshot that could be mid-animation or that you're
   eyeballing against dark backgrounds — confirm with the user or with measured boxes.

## Don't run headless-browser screenshots without being asked

The user explicitly does not want me spinning up headless Firefox/Chrome to screenshot.
When I need to see rendered output, ASK for a screenshot (or add a debug overlay and ask).

## Compare against the known-good reference FIRST (port/migration bugs)

**Context:** "On mobile, navigating shows the desktop navbar too." I burned ~20 build/
headless-test round-trips theorizing (scoped-style loss, root snapshots, stale composite
layers, CSS transitions, forced repaints) before the user — frustrated — pointed out the
Next.js original at `/Users/dave/Downloads/github/portfolio` doesn't have the bug.

**What went wrong:**
- This repo (`portfolio-v2`) is an Astro PORT of `../portfolio` (Next.js). For any bug in
  a port, the first question is "what did the port add/change vs the original?" — here, the
  whole class of cause was Astro's `ClientRouter` View Transitions + `transition:persist`,
  which the reference simply doesn't have. The CSS was byte-for-byte identical.
- I anchored on the persisted Layout comment claiming the bug was already fixed and chased
  exotic snapshot/paint theories instead of bisecting the actual trigger.

**Root cause (for the record):** `transition:persist` on `#navbar` corrupts its layout when
carried through a View Transition *after the mobile menu has been opened* — `getBoundingClientRect`
and `offsetTop` disagree, links paint spilled across the bar. Triggers ONLY via the real mobile
path (tap hamburger → tap link). Fix: drop `transition:persist` from the navbar and re-bind its
element listeners on every `astro:page-load` (document/window listeners registered once).

**How to apply next time:**
1. When the project is a port/migration and a sibling reference exists, diff against it EARLY.
   Ask "does the reference do this? what does the port add?" before theorizing mechanism.
2. Bisect to the minimal trigger before explaining *why*. One `parallel`-style A/B (remove
   `transition:persist`) localized it in one test; I should have reached for that on step 2,
   not step 20.
3. Don't trust a code comment that says "already fixed." Verify against the running build.
