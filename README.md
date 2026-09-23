# Internship Tracker

A single-user, local-first tracker for internship applications, referrals, interviews,
and follow-ups — built for running a 50-80 application search (Summer 2027
aerospace / space / robotics / hardware internships) without losing track of
anything. Everything lives in a SQLite file on your own machine. No accounts,
no auth, no server to pay for.

## Screenshots

<!-- TODO: add screenshots of the dashboard, board, table, and detail pages here. -->

## Features

- **Dashboard** — counts by status, a funnel chart (Applied → Screen →
  Interview → Offer) computed from each application's full status history
  (so an app rejected after a phone screen still counts as having reached
  the screen stage), applications-submitted-per-week bar chart, response
  rate, an "action needed" panel (overdue/due-today follow-ups, interviews
  and deadlines in the next 7 days), and a "stale" panel (Applied 21+ days
  with no update, with a one-click "mark as Ghosted").
- **Kanban board** — drag cards between status columns with keyboard or
  pointer support ([@dnd-kit](https://dndkit.com)); every drag logs a
  timeline event. Closed-out statuses (Accepted/Rejected/Withdrawn/Ghosted)
  aren't shown as columns — see [Defaults chosen](#defaults-chosen).
- **Table view** — sortable, filterable (status, tier, resume version,
  source), full-text search, and inline status editing.
- **Companies** — every application belongs to one company; company
  records hold a website and the login (username/email + password) for
  that company's application portal, shared across every role you apply
  to there. See [Companies & portal logins](#companies--portal-logins).
- **Application detail page** — edit every field, see the full timeline,
  log manual timeline entries (Note/Email/Interview/Follow-up), and link a
  referral contact.
- **Contacts** — list and detail views showing which applications each
  contact is linked to, editable from either side of the relationship.
- **Quick add** — press <kbd>N</kbd> anywhere to open a fast modal (company,
  role, URL, resume version, status) for logging a role in a few seconds.
  The company is matched or created by name automatically.
- **Autofill from a Claude chat** — paste a confirmation email or job
  posting into a separate Claude conversation using the provided template,
  then paste Claude's reply back into the New Application form to fill in
  every field at once. See
  [docs/claude-autofill-template.md](docs/claude-autofill-template.md).
- **Import / export** — full JSON backup and restore, CSV export, and CSV
  import with a column-mapping wizard for spreadsheets you already have.
- **Calendar export** — download an `.ics` of upcoming interviews and
  follow-ups.
- **Follow-up automation** — moving status to "Applied" auto-sets a
  follow-up date 14 days out if one isn't already set.
- Light/dark mode, responsive down to phone width, keyboard-navigable with
  visible focus states, and empty/loading states on every page.

## Tech stack

Next.js (App Router, TypeScript strict) · Tailwind CSS v4 · SQLite via
Prisma 7 (driver adapters, no native query engine) · @dnd-kit · Recharts ·
Zod · Vitest · ESLint + Prettier.

## Setup

Requires Node 20+.

```bash
npm install
npm run setup   # applies migrations and seeds the database
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

`npm install` generates the Prisma Client automatically (via a
`postinstall` hook). `npm run setup` runs `prisma migrate dev` followed by
`prisma db seed` — safe to re-run any time you want to reset back to seed
data (see below).

## Desktop app (macOS)

`desktop/` wraps the app in Electron so it runs as a real double-clickable
Mac app — no terminal, no `npm run dev`, no visible "localhost" anywhere.
On launch it spawns the production Next.js server internally, applies any
pending database migrations, and only then shows the window; the server
is killed when you quit. Its database lives at `~/Library/Application
Support/internship-tracker-desktop/dev.db`, entirely separate from the
`prisma/dev.db` used by `npm run dev` — the two don't share data
automatically (see below for moving data between them).

Build it (from the repo root, after `npm run build` so `.next/` is
current):

```bash
npm run build
cd desktop
npm install
npm run dist
```

That produces `desktop/dist/mac-arm64/Internship Tracker.app` (or
`mac-x64` on Intel Macs). Copy it into `/Applications` to install it:

```bash
cp -R "dist/mac-arm64/Internship Tracker.app" /Applications/
```

It's unsigned (this is a personal build, not something distributed
publicly), so the very first launch needs a right-click → **Open** to get
past Gatekeeper's "unidentified developer" warning — after that it opens
normally forever.

**Moving your data into it**: the desktop app starts with an empty
database. Easiest path — while both are closed, copy the SQLite file
directly (they use an identical schema):

```bash
cp prisma/dev.db "$HOME/Library/Application Support/internship-tracker-desktop/dev.db"
```

Or, without touching files directly: open the web version, use **Data →
Export → Full JSON backup**, then open the desktop app and use **Data →
Restore from JSON backup**.

Rebuilding after future code changes means repeating the three build
commands above and re-copying the `.app` into `/Applications` — Electron
doesn't auto-update from source.

## Seed data & your own data

- [`prisma/seed.example.json`](prisma/seed.example.json) — generic,
  made-up companies and contacts, committed to the repo. This is what a
  fresh clone seeds from by default.
- `prisma/seed.local.json` — **your real data**, git-ignored so it never
  gets committed. This repo's local checkout already has one pre-populated
  with the Wishlist/Applied companies from the original request (SpaceX,
  Relativity Space, Blue Origin, Tesla/Optimus, Rocket Lab, Stoke Space,
  Varda Space, Hadrian, Figure AI, Anduril, and Boeing). Edit it freely —
  it's yours.
- The seed script (`prisma/seed.ts`) uses `seed.local.json` if it exists,
  otherwise falls back to `seed.example.json`.
- **Reseeding is destructive**: `npm run setup` / `npm run db:seed` first
  deletes every application, contact, and event, then loads the seed file
  from scratch. Don't run it once you have real tracked progress you care
  about — use the JSON backup/export feature for that data instead (it's
  a completely separate mechanism from seeding).

## Companies & portal logins

Every application belongs to exactly one company. When you create an
application you pick an existing company or add one inline (a small "+
New" button opens a modal) without leaving the form; quick add and CSV
import instead match or create the company by name automatically.

A company record can also hold the login for that company's application
portal (Workday, Greenhouse, iCIMS, whatever they use) — one username and
password, shared across every application you file there, editable from
the company's own page (`/companies/[id]`). **This is stored in plain
text** in the local SQLite file: there's no master password or encryption
layer in this app (it was explicitly built with "no authentication
needed"), so there's nothing to encrypt the password against that isn't
also sitting right next to it. That's a reasonable trade for a personal,
single-user, local-only tool, but don't treat it as a real password
manager — and know that the full JSON backup export includes these
passwords in plain text too (the CSV export does not).

Deleting a company deletes every application under it (you're asked to
confirm, and the confirmation names the count) — an application can't
exist without a company, so there's no orphaned state to fall back to.

## Backup & restore

All of this lives under **Data** (`/data`) in the app:

- **Export → Applications CSV** — a spreadsheet of every application.
- **Export → Full JSON backup** — applications, contacts, and every
  timeline event. This is the file to keep around as a real backup.
- **Export → Calendar (.ics)** — upcoming interviews and follow-ups.
- **Import applications from CSV** — additive; maps arbitrary spreadsheet
  columns onto application fields and creates new rows. Never deletes or
  overwrites anything.
- **Restore from JSON backup** — the opposite of additive: it **replaces
  every application, contact, and event** with the contents of the backup
  file. The UI requires typing "RESTORE" to confirm before this runs. Use
  it to roll back to a known-good snapshot, not to merge in extra data.

Because this is a local SQLite file, you're also welcome to just copy
`prisma/dev.db` somewhere safe as an ad-hoc backup — the JSON export just
gives you something human-readable and portable across schema changes.

## Scripts

| Command                           | What it does                                          |
| --------------------------------- | ----------------------------------------------------- |
| `npm run dev`                     | Start the dev server                                  |
| `npm run build`                   | Regenerate the Prisma Client and build for production |
| `npm run start`                   | Run the production build                              |
| `npm run lint`                    | ESLint                                                |
| `npm run typecheck`               | `tsc --noEmit`                                        |
| `npm run test`                    | Vitest (single run)                                   |
| `npm run test:watch`              | Vitest (watch mode)                                   |
| `npm run format` / `format:check` | Prettier                                              |
| `npm run setup`                   | Migrate + seed (see above)                            |
| `npm run db:seed`                 | Re-seed without migrating                             |
| `npm run db:studio`               | Open Prisma Studio to browse the database             |

## Defaults chosen

The spec left a few things unspecified; here's what this build assumes,
and why — change any of these if they don't match how you actually work:

- **Kanban board shows only active statuses.** Accepted/Rejected/
  Withdrawn/Ghosted are closed-out outcomes with nothing left to act on,
  so they're excluded from the board's columns (still fully visible and
  editable in the table view and on the detail page).
- **Response rate & funnel use status _history_, not just current
  status.** An application rejected after a technical interview still
  counts as having reached the interview stage — otherwise every rejected
  application would look identical to one rejected on day one. This reads
  the timeline's "Status Change" events, not a separate tracked field.
- **`team`, `location`, `jobUrl`, and `reqId` are optional.** The spec
  marked only `team` explicitly optional, but in practice you rarely know
  a req ID or exact team before applying (or at the Wishlist stage before
  you've applied at all).
- **Companies are their own entity, not free text on the application**
  (added mid-build). The original spec had `company` as a plain string
  field on Application; it's now a required relation to a `Company`
  record, so multiple applications to the same company share one record —
  and one place to keep that company's portal login. See
  [Companies & portal logins](#companies--portal-logins) for the security
  trade-off of storing that password in plain text.
- **`seed.local.json`'s tiers**: the spec said Dream-or-Target for the ten
  wishlist companies but didn't say which is which. This build calls
  SpaceX, Blue Origin, Relativity Space, Rocket Lab, and Anduril "Dream",
  and Tesla/Optimus, Stoke Space, Varda Space, Hadrian, and Figure AI
  "Target". Boeing (status Applied) is tiered "Safety". Role titles
  default to "Mechanical Engineering Intern" and source to "Company Site"
  for all ten — edit `prisma/seed.local.json` directly, it's just JSON.
  "Tesla (Optimus)" is modeled as company `Tesla`, team `Optimus`.
- **CSV import is additive; JSON restore is destructive.** See
  [Backup & restore](#backup--restore).
- **One known `npm audit` finding**: `prisma`'s CLI bundles an optional
  `mysql2` driver (for projects using MySQL) with an open advisory. This
  app only ever uses the SQLite driver adapter — that code path never
  runs — and the fix would mean downgrading Prisma a full major version,
  so it's left as-is. Re-check with `npm audit` if this matters for your
  use case.

## Accessibility notes

Every input is labeled, focus states are visible everywhere (including
custom components like the modal and kanban cards), and the app is fully
usable on a phone-width viewport. The kanban board supports dragging via
mouse, touch, or keyboard (Tab to a card's grip handle, Space to pick up,
arrow keys to move, Space to drop) — but keyboard-driven cross-column
drag-and-drop is inherently a little fiddly in any implementation, so the
table view's inline status dropdown and the detail page's status field are
the fully keyboard-reliable ways to change status.

## Project structure

```
desktop/
  main.js              Electron main process (spawns the server, opens the window)
  afterPack.js         Packaging hook: copies the built app in and rebuilds
                        native modules (better-sqlite3) for Electron's ABI
docs/
  claude-autofill-template.md   The paste-into-Claude prompt, explained
prisma/
  schema.prisma       Data model (SQLite; no native enums — see comments)
  seed.ts             Seed script (loads seed.local.json or seed.example.json)
  seed.example.json   Committed, generic demo data
  seed.local.json     Git-ignored, your real data
src/
  app/                Routes (App Router)
  actions/            Server actions (mutations, Zod-validated)
  components/         UI, grouped by feature area
  lib/                Business logic, validation, Prisma client, CSV/ICS/backup helpers
  generated/prisma/   Generated Prisma Client (git-ignored, run `npm install` or `prisma generate`)
```

## License

MIT — see [LICENSE](LICENSE).
