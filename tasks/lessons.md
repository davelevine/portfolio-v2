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

## Copy edits: change only what was asked, and think about the punctuation's job

**Context:** During the Heap redesign, several copy corrections were avoidable:
- Asked to drop the period after "A few good places to start", I removed it. It leads into a list,
  so it needed a colon ("come on").
- Asked to restore "raising two kids", I also rewrote the rest of the line, which was already fine.
- A tagline got `text-wrap: balance`, which split one line into two and looked deliberate.

**How to apply next time:**
1. A lead-in to a list or example ends in a colon. Ask what the punctuation does, not just whether to delete it.
2. When one phrase is flagged, change that phrase only. Keep everything the user didn't mention.
3. Dave's copy preference is terse and plain. No slogans, no calls to action like "Want to talk?", no aphorisms.
4. Never reuse wording from the reference site (michaelheap.com). Check new copy against it.

## Content schema changes need a dev-server restart

**Context:** After adding `ail` to `src/content.config.ts`, the production build showed badges but
Dave's running `astro dev` did not. The dev server keeps the schema it started with and silently
strips unknown frontmatter fields. Touching the config did not reload it.

**How to apply next time:** Whenever a change adds or changes collection fields, tell the user to
restart the dev server. Verify against a fresh `astro dev --background` (then `astro dev stop`),
not just `astro build`. Astro 7 refuses a second dev server while one is running.
