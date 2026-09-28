// Migration: copy clean how-tos from the docs repo into /notes with injected
// frontmatter (title, date-from-git, description, lowercase topic tags). Handles
// the MkDocs cleanup the docs repo's own prepare-docs.mjs does (H1 strip, --8<--
// snippet markers, ** in headings, backslash escapes).
//
// The MANIFEST is the curation point: only files verified clean (no secrets,
// no internal IPs/hostnames) belong here. Scrub-and-review candidates are kept
// out until redacted.
//
// Usage: node scripts/migrate-notes.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_ROOT = process.env.HOME + '/downloads/github/docs';
const SRC_PREFIX = 'legacy/content/';
const OUT_DIR = fileURLToPath(new URL('../src/content/notes', import.meta.url));

// Curation: specific "how do I do X" notes only. Study guides, overviews, personal config
// dumps, live-network detail, verbatim copies of others' articles and stubs stay behind.
//
// source path (relative to legacy/content) -> topic tags (lowercase; the first one is the
// note's heading on /notes). Optional: `scrub` ([pattern, replacement], after the global
// SCRUBS below) and `ail` (AI Influence Level, default 0).
const MANIFEST = [
  // aws
  { src: 'cloud-computing/aws/s3/how-to-copy-local-files-to-s3-with-aws-cli.md', topics: ['aws', 's3'] },
  { src: 'cloud-computing/aws/s3/s3-cloudflare-cors-error.md', topics: ['aws', 's3', 'cloudflare'] },
  { src: 'cloud-computing/aws/serverless/hardening-https-security-headers-using-aws-lambda-edge-and-cloudfront.md', topics: ['aws', 'cloudfront', 'lambda'],
    scrub: [[/ (\\\*){4}/g, ' ']] }, // stray escaped \*\*\*\* in the source

  // cloudflare
  { src: 'cloud-computing/cloudflare/how-to/how-to-check-ssl-validity-of-cloudflare-domain.md', topics: ['cloudflare'] },
  { src: 'cloud-computing/cloudflare/how-to/how-to-use-a-root-domain-as-a-cname.md', topics: ['cloudflare'],
    // Formatting only: the note and quoted post belong under the first reference, and the
    // quote is prose, not code (a fence renders it as one long scrolling line).
    scrub: [[/\n\n(Search the page for [^\n]*)\n\n```markdown\n([^\n]*)\n```/, '\n\n    $1\n\n    > $2']] },
  { src: 'cloud-computing/cloudflare/how-to/how-to-keep-subdomain-dns-pointing-to-correct-public-ip.md', topics: ['cloudflare', 'dns', 'pfsense'] },
  { src: 'cloud-computing/cloudflare/how-to/how-to-properly-cache-images-from-b2.md', topics: ['cloudflare', 'b2'],
    scrub: [[/DO-Bookstack/gi, 'my-bucket']] },
  { src: 'cloud-computing/cloudflare/workers/applying-security-headers-with-cf-workers.md', topics: ['cloudflare', 'workers'] },
  { src: 'cloud-computing/cloudflare/workers/how-to-redirect-domains-using-cloudflare-workers.md', topics: ['cloudflare', 'workers'] },
  { src: 'cloud-computing/cloudflare/workers/how-to-remove-b2-bucket-prefix.md', topics: ['cloudflare', 'workers', 'b2'],
    scrub: [[/DO-Bookstack/gi, 'my-bucket']] },

  // docker
  { src: 'homelab/reference/docker/how-to-update-all-docker-images.md', topics: ['docker'],
    scrub: [[/```markdown\n/, '```bash\n']] }, // a shell command, fenced as markdown in the source
  { src: 'homelab/reference/docker/how-to-send-an-image-to-docker-hub.md', topics: ['docker'],
    scrub: [[/dlevine78/g, '<username>'], [/docker-engine/g, 'docker-host']] },
  { src: 'cloud-computing/digitalocean/databases/how-to-copy-sql-file-to-container.md', topics: ['docker', 'mysql'] },
  { src: 'homelab/archive/authentication/authentik-setup-guide.md', topics: ['docker', 'authentik'],
    scrub: [[/identity\.levine\.io/g, 'auth.example.com']] },

  // git
  { src: 'homelab/git/how-to/how-to-backup-dotfiles-to-github.md', topics: ['git', 'github', 'cron'] },
  { src: 'homelab/git/how-to/how-to-clone-a-git-repo-with-submodules.md', topics: ['git', 'submodules'] },
  { src: 'homelab/git/how-to/how-to-delete-a-submodule.md', topics: ['git', 'submodules'] },
  { src: 'homelab/git/how-to/how-to-fix-detached-head-on-git-repo.md', topics: ['git'] },
  { src: 'homelab/git/how-to/how-to-remove-a-commit.md', topics: ['git'] },

  // linux
  { src: 'homelab/reference/cron/cron-syntax.md', topics: ['linux', 'cron'] },
  { src: 'homelab/reference/linux/how-to-count-number-of-files-in-a-directory-in-linux.md', topics: ['linux'] },
  { src: 'homelab/reference/linux/how-to-find-whats-using-disk-space-in-linux.md', topics: ['linux'] },
  { src: 'homelab/reference/linux/how-to-get-the-size-of-a-directory-in-linux.md', topics: ['linux'] },
  { src: 'homelab/reference/linux/how-to-resize-a-logical-volume-lvm-in-ubuntu.md', topics: ['linux', 'lvm', 'ubuntu'] },
  { src: 'homelab/reference/linux/how-to-increase-the-size-of-a-linux-lvm-by-adding-a-new-disk.md', topics: ['linux', 'lvm'],
    scrub: [[/192\.168\.1\.6/g, 'nas.local'], [/xen-plex/g, 'server']] },
  { src: 'homelab/reference/linux/cifs-shares-dependency-chains.md', topics: ['linux', 'systemd', 'tailscale'],
    scrub: [[/100\.122\.167\.110/g, 'nas.local']] },
  { src: 'homelab/reference/linux/zsh/how-to-add-an-alias-to-zsh.md', topics: ['linux', 'zsh'] },
  { src: 'homelab/archive/linux/ubuntu/migrating-ubuntu-server.md', topics: ['linux', 'ubuntu'] },
  { src: 'homelab/archive/linux/manjaro/openbox/how-to-restart-mullvad-daemon-after-update.md', topics: ['linux', 'mullvad', 'systemd'] },

  // manjaro (Arch)
  { src: 'homelab/reference/linux/how-to-remove-packages-with-dependencies.md', topics: ['manjaro', 'pacman'] },
  { src: 'homelab/archive/linux/manjaro/openbox/how-to-clear-pacman-cache-and-force-upgrade.md', topics: ['manjaro', 'pacman'] },
  { src: 'homelab/archive/linux/manjaro/openbox/how-to-restore-aur-packages-to-pamac.md', topics: ['manjaro', 'pacman'] },
  { src: 'homelab/archive/linux/manjaro/how-to-setup-bluetooth-on-manjaro.md', topics: ['manjaro', 'bluetooth'] },
  { src: 'homelab/archive/linux/manjaro/openbox/how-to-remove-window-decorations.md', topics: ['manjaro', 'openbox'] },
  { src: 'homelab/archive/linux/manjaro/polybar/how-to-add-a-module-to-polybar.md', topics: ['manjaro', 'polybar'] },

  // macos
  { src: 'homelab/reference/macos/how-to-automatically-disable-wifi-when-connected-to-ethernet.md', topics: ['macos'] },
  { src: 'homelab/reference/macos/how-to-remove-title-bar-from-iterm2.md', topics: ['macos', 'iterm2'] },

  // networking
  { src: 'homelab/reference/networking/pfsense/how-to-setup-dns-over-tls.md', topics: ['networking', 'pfsense', 'dns'],
    scrub: [[/108\.6\.62\.149/g, '203.0.113.10'], [/to\[\]\([^)]*\)/g, 'to ']] }, // empty link in the source
  { src: 'homelab/reference/networking/ubiquiti/link-aggregation.md', topics: ['networking', 'unifi', 'synology'] },

  // nginx
  { src: 'homelab/reference/nginx/how-to-cache-php-pages-in-nginx.md', topics: ['nginx', 'php', 'caching'] },
  { src: 'homelab/reference/nginx/how-to-use-nginx-for-in-memory-caching.md', topics: ['nginx', 'caching'] },

  // ssh
  { src: 'homelab/reference/ssh/how-to-generate-and-store-ssh-keys.md', topics: ['ssh'],
    scrub: [[/192\.168\.1\.70/g, '192.0.2.10'], [/192\.168\.1\.95/g, '192.0.2.11'], [/xenadmin/g, 'admin'],
      [/yunohost/g, 'server1'], [/confluence/g, 'server2']] },

  // synology
  { src: 'homelab/reference/synology/disk-space-is-full.md', topics: ['synology'] },

  // vscode
  { src: 'homelab/git/vs-code/how-to-force-vs-code-to-open-files-in-new-tabs.md', topics: ['vscode'] },
  { src: 'homelab/git/vs-code/how-to-migrate-from-vs-code-to-vs-codium.md', topics: ['vscode'] },
];

// Applied to every note: zero-width characters, Healthchecks ping UUIDs, 32-hex Cloudflare account/zone/KV IDs, AWS keys,
// and personal git identity.
const SCRUBS = [
  [/[\u200B-\u200D\uFEFF]/g, ''], // zero-width characters (one hid in a title)
  [/hc-ping\.com\/[0-9a-f-]{36}/g, 'hc-ping.com/<uuid>'],
  [/"[0-9a-f]{32}"/g, '"<id>"'],
  [/dave@davelevine\.io/g, 'you@example.com'],
  // AWS credentials -> AWS's documented example values.
  [/\bA(KIA|SIA)[0-9A-Z]{16}\b/g, 'AKIAIOSFODNN7EXAMPLE'],
  [/(Secret Access Key:?[ \t]*|aws_secret_access_key[ \t]*=[ \t]*)[A-Za-z0-9/+]{40}/g, '$1wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'],
];

// Refuse to write a note that still matches any of these after scrubbing.
const GUARDS = [
  /PRIVATE KEY/, /192\.168\.\d+\.\d+/, /\b100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+\b/, /\.ts\.net\b/,
  /hc-ping\.com\/[0-9a-f]{8}-/, /(?<![/\w])[0-9a-f]{32}\b/, /dave@davelevine\.io/, /Klim/, /ondigitalocean\.com/,
  /dlevine(78|87)/, /unifiadmin/,
  /\bA(KIA|SIA)(?!IOSFODNN7EXAMPLE)[0-9A-Z]{16}\b/, /(Secret Access Key|aws_secret_access_key)\W*(?!wJalrXUtnFEMI)[A-Za-z0-9/+]{40}/,
];

// First-edit (creation) date via git --follow, tracing through the docs repo's renames.
function firstDate(src) {
  const out = execSync(
    `git log --follow --format='%aI' --diff-filter=A -- "${SRC_PREFIX}${src}"`,
    { cwd: DOCS_ROOT, encoding: 'utf-8' }
  ).trim();
  return out.split('\n').filter(Boolean).pop() || null;
}

// MkDocs Material blocks -> plain markdown. Bodies are the 4-space-indented lines that follow.
//   !!! type "Title"   -> blockquote led by the bold title (type name when no title)
//   ??? type "Title"   -> <details> (collapsible, as in MkDocs)
//   === "Tab"          -> bold tab label, body un-indented
function convertBlocks(content) {
  const lines = content.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(!!!?|\?\?\?\+?|===)\s*(\w+)?\s*(?:"(.*)")?\s*$/);
    if (!m) { out.push(lines[i]); continue; }
    const [, kind, type, rawTitle] = m;
    const body = [];
    while (i + 1 < lines.length && (/^\s*$/.test(lines[i + 1]) || /^ {4}/.test(lines[i + 1]))) {
      body.push(lines[++i].replace(/^ {4}/, ''));
    }
    while (body.length && !body[body.length - 1].trim()) body.pop();
    while (body.length && !body[0].trim()) body.shift();
    const title = (rawTitle ?? '').replace(/:[\w-]+:\s*/g, '').trim();
    if (kind === '===') {
      out.push(`**${title}**`, '', ...body, '');
    } else if (kind.startsWith('???')) {
      out.push('<details>', `<summary>${title || type}</summary>`, '', ...body, '', '</details>', '');
    } else {
      const label = rawTitle === '' ? '' : title || type[0].toUpperCase() + type.slice(1);
      const quoted = body.map((l) => (l ? `> ${l}` : '>'));
      out.push(...(label ? [`> **${label}**`, '>'] : []), ...quoted, '');
    }
  }
  return out.join('\n');
}

function yamlQuote(s) {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function main() {
  const outs = MANIFEST.map((m) => basename(m.src));
  const dupe = outs.find((o, i) => outs.indexOf(o) !== i);
  if (dupe) throw new Error(`two notes would write ${dupe}`);
  for (const item of MANIFEST) {
    const full = join(DOCS_ROOT, SRC_PREFIX, item.src);
    let content = (await readFile(full, 'utf-8')).replace(/^---\n[\s\S]*?\n---\n+/, '');
    for (const [re, to] of [...SCRUBS, ...(item.scrub ?? [])]) content = content.replace(re, to);

    // Title from the first H1; description from the first paragraph after "## Summary".
    const h1 = content.match(/^#\s+(.+)$/m);
    const title = h1 ? h1[1].replace(/\\([()[\]*_`\\])/g, '$1').trim() : basename(item.src);
    const summaryMatch = content.match(/^#{2,3}\s+\*{0,2}Summary\*{0,2}\s*\n+([\s\S]*?)(?=\n#{2,3}\s)/m);
    let description = '';
    if (summaryMatch) {
      const firstPara = summaryMatch[1]
        .split(/\n\s*\n/)
        .find((p) => p.trim() && !/^[-*_\s]+$/.test(p.trim()));
      description = firstPara ? firstPara.trim().replace(/\s+/g, ' ').replace(/^[-*]\s+/, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\[([^\]]+)\](?:\[[^\]]*\])?/g, '$1').replace(/\s*\(\d+\)\s*\{\s*\.annotate\s*\}/g, '') : '';
    }

    // Strip the H1 (frontmatter title renders as the heading).
    content = content.replace(/^#\s+.+\n+/, '');

    // Drop only the "## Summary" heading (and a rule under it); its paragraphs stay as the
    // note's lead. The page doesn't render the description, so nothing may be cut here.
    content = content.replace(/^#{2,3}[ \t]+\*{0,2}Summary\*{0,2}[ \t]*\n+(?:-{3,}\n+)?/m, '');

    // MkDocs cleanup, mirroring docs' prepare-docs.mjs.
    content = content.replace(/^[ \t]*--8<--[ \t]*"[^"]*"[ \t]*\n?/gm, ''); // snippet includes
    content = content.replace(/\\([()[\]*_])/g, '$1');               // backslash escapes
    content = content.replace(/^(#{1,6})[ \t]+\*\*(.+?)\*\*[ \t]*$/gm, '$1 $2'); // bold headings
    content = convertBlocks(content);
    content = content.replace(/^[ \t]*<\/?(figure|div)\b[^>]*>[ \t]*\n?/gm, '');   // <figure markdown>, <div class="annotate">
    // MkDocs annotations -> footnotes: "(1)" ending a line becomes [^1], and its
    // "1. :material-arrow-right-bottom: text" list item becomes the footnote.
    if (/^\d+\. :material-arrow-right-bottom:/m.test(content)) {
      content = content.replace(/^(\d+)\. :material-arrow-right-bottom:[ \t]*/gm, '[^$1]: ');
      content = content.replace(/[ \t]*\((\d+)\)(?=[ \t]*(\{\s*\.annotate\s*\})?[ \t]*$)/gm, '[^$1]');
    }
    content = content.replace(/^[ \t]*\{\s*\.annotate\s*\}[ \t]*\n?/gm, '');         // annotation markers
    content = content.replace(/:(material|octicons|fontawesome)-[\w-]+:\s*/g, ''); // icon shortcodes
    content = content.replace(/^<!--\s*markdownlint-\w+\s*-->[ \t]*\n?/gm, '');
    content = content.replace(/\[([^\]]*)\]\((?!https?:|#|mailto:)[^)]*\)/g, '$1'); // old-site internal links -> text

    // No Summary section: fall back to the first prose paragraph.
    if (!description) {
      const para = content.split(/\n\s*\n/).map((p) => p.trim()).find((p) => /^[A-Za-z]/.test(p));
      description = para ? para.replace(/\s+/g, ' ').replace(/[*_`]/g, '').slice(0, 200) : '';
    }

    const leak = GUARDS.find((re) => re.test(content) || re.test(title) || re.test(description));
    if (leak) throw new Error(`${item.src}: still matches ${leak} after scrubbing`);

    const date = firstDate(item.src);
    if (!date) { console.error(`no date for ${item.src}`); continue; }

    const fm = [
      '---',
      `title: ${yamlQuote(title)}`,
      `date: "${date}"`,
      `description: ${yamlQuote(description)}`,
      'topics:',
      ...item.topics.map((t) => `  - ${t}`),
      `ail: ${item.ail ?? 0}`, // AI Influence Level; all migrated notes are human-written
      '---',
      '',
    ].join('\n');

    const outPath = join(OUT_DIR, basename(item.src));
    await writeFile(outPath, fm + content.trimStart() + '\n');
    console.log(`wrote ${basename(outPath)}  (${title})`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
