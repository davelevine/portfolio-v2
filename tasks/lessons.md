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
stop the dev server, clear the content cache, and start it again:
`rm -rf .astro node_modules/.astro && npm run dev`. A plain restart is NOT always enough: when
`imageDark` was added, a dev server started after the schema edit still served entries parsed
under the old schema from the persisted data store. Diagnose with a temporary endpoint that
returns `Object.keys(entry.data)`. Confirm the code works using a fresh dev server in a clean
worktree on another port (it has its own caches, so Astro allows it). Astro 7 refuses a second
dev server in the same folder.

## Don't switch branches under the user's running dev server

**Context:** To start a fix branch, I ran `git switch -c … origin/main` while Dave's `astro dev` was
running, assuming nothing changed because the trees were identical. Git still rewrote 106 of 107
files under `src/`. The dev server's watcher then rebuilt its content store without the `home`
entry, and the home page crashed with "Cannot read properties of undefined (reading 'data')".

**How to apply next time:**
1. If the user's dev server is running, do branch work in a separate `git worktree`, not in their
   working directory. The same goes for `npm run build`, which shares Astro's cache directory.
2. Never claim a checkout "doesn't touch files". Identical contents don't mean untouched files.
3. If it happens anyway, the fix is: stop the dev server, `rm -rf .astro node_modules/.astro`, then restart.

## "Ship it" means commit, push, and PR. Never merge.

**Context:** On PR #68 I took "ship it" as permission to squash-merge into `main`. Later I also
committed and pushed to PR #69 after Dave had only approved a change, not a commit. His
correction: "Why are you shipping? I haven't told you to ship" and "do not merge. That's not
your job."

**How to apply next time:**
1. Approving a change does not mean "commit it". Leave edits uncommitted for review until he says to commit or ship.
2. "Ship" means commit, push, and open or update the PR. Merging is Dave's job, always, even when checks are green.

## A failed build can hide behind a stale dist/

**Context:** To check that removing `@astrojs/markdown-remark` was safe, I rebuilt and compared the
HTML against a baseline. It reported "identical on 90/90", but the build had actually failed
(Astro 7 needs that package to run `markdown.rehypePlugins`). The comparison read the previous
build's `dist/`. My grep filter hid the error. A fresh-worktree build for the PR caught it.

**How to apply next time:** before any before/after comparison, `rm -rf dist`, capture the build's
exit code and page count, and refuse to compare unless both builds succeeded. "Nothing imports it"
doesn't prove a dependency is unused; the framework may load it implicitly.

## "Like Heap's" means borrow the named parts, not replace the page

**Context:** Asked to flesh out /uses "in a similar way" to michaelheap.com, I rebuilt it as
Heap's heading-plus-paragraph page and deleted the name + role rows. Dave wanted to keep his rows,
add the writeups underneath, and borrow only Heap's bordered boxes.

**How to apply next time:** when a reference site is cited, change only what was named (content,
a visual treatment) and keep the existing structure. If the ask could mean a restructure, say what
would be removed before removing it.

## Don't infer style rules from a small sample

**Context:** During a voice pass on /uses, I counted semicolons in six posts, found almost none, and
removed Dave's semicolons as "not his voice." He uses them often.

**How to apply next time:** a handful of posts isn't enough to call a habit. Keep punctuation and
phrasing as he wrote it, and only flag something as off-voice when it's clearly generic filler or
jargon. When unsure, ask instead of editing.

## When a design fix misses twice, ask instead of guessing

**Context:** An audit flagged the /ail "Reading the badge" heading as inconsistent. I tried a
section rule, then folding the examples into the intro, then a single sentence. Dave disliked each
one, and the original turned out to be what he wanted.

**How to apply next time:** audit findings are suggestions, not defects. After a design revision
misses twice, stop and ask what feels off (or offer the original back) before trying a third.

When restoring, restore only the part named. Asked to restore the badge section, I also reverted
"The Levels" divider he liked, because I treated the whole layout file as one unit.

## Build what was proposed, not a broader version of it

**Context:** I proposed a "Superseded" label on /decisions rows, then implemented it as "any status
that isn't Accepted," which also put "Partially superseded" on ADR 0077's row. Dave didn't want it
in the list.

**How to apply next time:** implement the rule as it was described and approved. If the code would
reach cases the proposal didn't mention (other status values, other categories), list those cases
and ask before including them.

## Describe proposals by what the user sees, not how they're built

**Context:** I offered /decisions filter buttons "with per-category routes, reusing the /writing
setup." Dave approved, but he pictured the buttons filtering the list on the same page; each
button went to a separate page that dropped the intro.

**How to apply next time:** describe UI proposals by behavior ("each button opens its own page" vs
"the list filters in place and the page stays put"). "Similar to X" means it looks similar; confirm
the behavior before copying X's implementation.
