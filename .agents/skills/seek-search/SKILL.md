---
name: seek-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for jobs in Australia — find job
  listings on Seek, look up a specific Seek job posting, or check Perth/WA (or any
  Australian city/region) job openings. Trigger phrases: find a job, job search, search
  for jobs, job openings, vacancies, hiring, positions open, "are there any X jobs in
  Perth/Australia", look up this Seek job posting.
context: fork
allowed-tools: Bash(bun run skills/seek-search/cli/src/cli.ts *)
---

# Seek Search Skill

Search live job listings from Seek.com.au's public job search API for any Australian
location. No authentication, no API key, zero runtime dependencies — runs with just `bun`.

## ⚠️ Personal use only

This uses Seek's public (undocumented) search API; keep volume low and don't use it
commercially or for bulk data collection. Run it on your own responsibility.

## When to use this skill

- Search for job openings in a given Australian location, e.g. "Perth WA"
- Filter by recency (posted within 1/3/7/14/30 days)
- Get whatever detail is available for a specific job listing (best-effort — see below)

## Commands

### Search job listings

```bash
bun run skills/seek-search/cli/src/cli.ts search --location "<place>" [flags]
```

Key flags:
- `--location <text>` / `-l <text>` — **required.** e.g. `"Perth WA"`, `"Fremantle WA"`, `"Australia"`.
- `--query <text>` / `-q <text>` — keyword search (title, skill, role). Recommended.
- `--daterange <days>` — posted within N days: `1`, `3`, `7`, `14`, `30`. Omit for all postings.
- `--page <n>` — page number (1-indexed, 20 results per page).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch job detail (best-effort)

```bash
bun run skills/seek-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the job ID from `search` results. Seek blocks direct fetches to its job pages for
many listings (`HTTP 403`) — when that happens, the command reports the direct URL instead
of failing silently. Prefer the `teaser`/`salary`/`workType` fields already in `search`
results when `detail` is blocked.

## Usage examples

```bash
# Hospitality roles in Perth, posted today
bun run skills/seek-search/cli/src/cli.ts search -q "hospitality" -l "Perth WA" --daterange 1 --format table

# Any role in Perth, last 7 days
bun run skills/seek-search/cli/src/cli.ts search -l "Perth WA" --daterange 7 --format table
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process
exits with code `1`.

## Notes

- Data is from Seek's public search API — no credentials required.
- Job IDs are numeric (e.g. `92986687`).
