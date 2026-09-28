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
1. Do the work in Dave's checkout, not a separate worktree: he reviews changes with `npm run dev`
   there ("I'd rather just run it from the one we're working in"). When a branch switch is needed
   with his dev server running, do it and tell him to restart it with the cache clear in step 3.
   Builds for verification still go in a scratch copy, since `npm run build` shares Astro's cache.
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

## Match a style to the content's role, not just its position on the page

**Context:** I recommended moving the /now opening sentence into the gray page intro because other
pages have one there, and earlier put the /decisions explainer in the /now "Update" box. Dave
reverted both after seeing them. The /now sentence is a personal note with two links, not a page
description, and in the header it pushed the date away from the title. The /decisions text was the
whole intro, so the box had nothing to set it apart from.

**How to apply next time:** before proposing "make X match page Y," check that X does the same job
as the thing on Y. If it only sits in the same spot, say so and recommend leaving it.

## Flag reputational risk once, then defer to Dave's read

**Context:** Porting "Career Advice," I flagged its Weill Cornell paragraphs as risky on a portfolio
site, and the edits that followed went from cutting them to anonymizing them. Dave's view was that
naming WCM is fine; the only problem was the "dry and stuffy" framing.

**How to apply next time:** name the specific phrase that carries the risk, not the whole passage,
and propose the smallest change to that phrase. Dave knows his workplace; one flag is enough.

## A constraint stated for one line applies to that line only

**Context:** Dave asked for a stronger single-line version of the home page's "Exploring" row. While
measuring it, I found my earlier "Sharing" and "Living" rewrites wrapped too, and rewrote them as
well. He only wanted "Exploring" changed; the other two were already approved.

**How to apply next time:** change only the item asked about. If the same constraint reveals a
problem elsewhere, report it with a suggested fix and let Dave decide. Don't apply it.

## On personal pages, fix sentences; don't add new ones

**Context:** Asked to improve /about "as long as it sounds like me," I made fixes to existing
sentences (a dangling reference, the start year) and also added two new sentences: a link to
/writing and a contact/resume call to action. Dave kept the fixes and cut both new sentences.

**How to apply next time:** on About-style pages, suggest new sentences but don't write them in
unless asked. Keep "résumé" as "resume."

## Put open questions where they can't be missed

**Context:** Fixing list-row spacing on the right, I noticed titles on /decisions and /certs sat
flush on the left too, and asked about it in the last line of my reply. Dave merged without
seeing it and wanted it fixed; it needed a second PR.

**How to apply next time:** when a fix leaves an obvious mirror-image gap (the other side, the
sibling page), ask about it at the top of the reply, before saying the work is ready. Still don't
apply it without a yes.

## Old posts are historical record; don't unlink dead links

**Context:** In the site audit cleanup, dead links in old posts were swapped for Wayback snapshots,
or turned into plain text when no snapshot existed. Dave wanted none unlinked: the links were
accurate when the posts were written, and he doesn't maintain links in old posts.

**How to apply next time:** leave dead links in /writing posts (and similar archival pages) as they
are. Typo fixes are still fine. Don't list dead links in old posts as audit findings.

## Work from the local repo, not the live site

**Context:** While migrating notes out of the docs repo, triage found secrets in a few files. I then
curled docs.levine.io to check whether they were publicly served. Dave: "You don't need to access
the docs site, the information lives at ~/downloads/github/docs."

**How to apply next time:** when the source of truth is a local repo, read the repo. Don't probe the
live deployment (or other external services) unless asked; flag the exposure question instead.

## Migrating content: curate for the destination, not just for safety

**Context:** Moving the docs repo into /notes, I screened files only for secrets and duplicates and
migrated 81, including AWS study guides, an acronym list and config dumps. Dave: "Some content doesn't
make sense to add here (e.g. acronyms). I need you to be a bit more selective," and older content
"should be treated as such."

**How to apply next time:** judge each file against what the destination section *is* (for /notes:
a specific "how do I do X" snippet, Heap-TIL style). Reference material, study notes, overviews and
personal config dumps don't qualify even when they're clean. Mark old content as dated rather than
presenting it as current.

## Don't add editorial labels to Dave's content by rule

**Context:** Asked to treat older notes "as such," I added an age-based "Written <date>, so parts
may be out of date" banner to every note over three years old, including still-accurate ones like
link aggregation. Dave: "This is not appropriate," then "If you added the banner, you should remove
it from anything you added it to."

**How to apply next time:** don't stamp content with a blanket editorial label (age warnings,
disclaimers) derived from a heuristic. Propose the specific wording and which pages it lands on, and
get approval, before it goes on anything.

## Alignment fixes: predict from the code, then check the screenshot matches the code

**Context:** The navbar brand looked high after the font change. I measured one screenshot, removed
a 1px nudge, and made it worse. The next screenshot turned out to show the old CSS. Dave: "I think
you should be measuring from the code too."

**How to apply next time:**
1. Compute the expected offset from CSS plus real font metrics (fontTools on the actual font file):
   line-height, baseline alignment, cap and x-height centers per font size.
2. Measure glyph extents in the screenshot and check they match the prediction for the *current*
   code before acting. A mismatch means a stale page or the wrong server, not a new theory.
3. Level to the optical center (cap/x-height centers), not just a shared baseline, when font sizes
   differ.
4. If the measurements say level and it still looks off, the cause is optical weight, not position.
   The navbar brand measured level for several rounds and still "looked high"; what fixed it was
   size (17 → 16px) and weight (550 → 500), not more nudging. Offer weight/size early.

## Bulk content migrations: audit the output against the source before calling it done

**Context:** The notes migration script looked right on a spot check, but Dave found broken
formatting on /notes/how-to-use-a-root-domain-as-a-cname/. The script had deleted whole Summary
sections (not just the heading) on 42 notes, cutting intro paragraphs from 14 of them and every
page's opening paragraph (the description isn't rendered). A `^\s*` line-strip regex also ate the
blank lines around tables, gluing them into lists.

**How to apply next time:**
1. Run a source-vs-output text-loss check: every substantial source line must appear in the output,
   and every miss must be an intended scrub.
2. Scan the *rendered* HTML for markdown that didn't render (table pipes in `<p>`, unresolved
   `[ref]` links, stray `**`, leftover source-tool syntax).
3. In line-level regexes use `[ \t]`, never `\s`, next to `^`/`$` with the m flag: `\s` crosses lines.
4. Never cut content to build metadata unless the page renders that metadata.

## Secret scans need provider credential patterns, not just the values you expect

**Context:** The notes-migration scrubs and guards targeted things triage had named (private IPs,
ping IDs, Cloudflare IDs, private keys). A real AWS access key and secret in an `aws configure`
example slipped through and was only caught by GitHub push protection on the first push.

**How to apply next time:** before any push of migrated or pasted content, scan for provider
credential formats (AWS `AKIA`/`ASIA` + 40-char secrets, GitHub `ghp_`, Slack `xox*-`, Google
`AIza`, OpenAI-style `sk-`, `-----BEGIN ... KEY`, `password|token|secret =`), not only the values
the triage listed. If one is found in unpushed commits, fix and squash it out of history before
pushing; never use the push-protection bypass.

## When the user reframes the criteria, re-run the earlier decisions under it

**Context:** Midway through the notes migration Dave said the documents are legacy and "the date on
the page says it all." I stopped adding dated banners but kept excluding files for being outdated
or deprecated, the very reason the reframe removed. He later listed notes that "have been missed."

**How to apply next time:** when a user's statement changes what counts (e.g. "legacy, treat as
such"), go back through every earlier include/exclude decision and re-apply the new rule, then show
the diff, instead of applying it only to what comes next.

## A scrub list is a list of the secrets: never commit it

**Context:** The notes migration script replaced identifiers with placeholders, and each rule held
the literal it removed (home WAN IP, tailnet and LAN IPs, internal hostnames, usernames, database
hosts). PR #86 committed the script to the public repo, publishing exactly what the notes hid. It
was caught only while scanning the next PR.

**How to apply next time:** any script, config or test that names the values it redacts is itself
sensitive. Keep it out of git (gitignored local path) or express its rules as generic patterns. Run
the secret scan over *every* file in the diff, scripts included, not just the content.

## Never quote removed personal information in public text

**Context:** Dave removed his town and phone number from his résumé. In the public PR #90, I quoted
exactly those values as "what changed." The repo is public, and GitHub keeps PR description edit
history, so scrubbing the body afterward didn't fully undo it. Dave: "Not cool."

**How to apply next time:** describe removals of personal details generically ("drops location
and phone"). Before posting a PR body, commit message or issue, scan it for personal values
(phone numbers, addresses, towns, names, personal emails), and drop the old values from test
evidence too. Checking a diff locally is fine; publishing its contents is not.
