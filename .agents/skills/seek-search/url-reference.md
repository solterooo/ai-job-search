# Seek.com.au Jobs URL Reference

Public, unauthenticated JSON endpoint used by Seek's own web search UI.

> Personal use only — this is not an official/documented API; keep request volume low.

## Search

```
GET https://www.seek.com.au/api/jobsearch/v5/search
```

Query params:

| Param | Meaning | Example |
|-------|---------|---------|
| `siteKey` | Fixed site identifier | `AU-Main` |
| `sourcesystem` | Fixed source identifier | `houston` |
| `keywords` | Free-text query | `hospitality` |
| `where` | Location string | `Perth WA` |
| `daterange` | Posted within N days | `1`, `3`, `7`, `14`, `30` |
| `sortmode` | Sort order | `ListedDate` (newest first) or `KeywordRelevance` (default) |
| `page` | 1-indexed page number | `1` |
| `pageSize` | Results per page | `20` |

Returns JSON: `{ data: [...jobs], totalCount: number, ... }`. Each job has `id`, `title`,
`companyName` (or `advertiser.description` for private ads), `locations[0].label`,
`listingDate`, `listingDateDisplay`, `salaryLabel`, `workTypes[0]`, `teaser`.

Verified live 2026-07-04: `keywords=hospitality&where=Perth WA` returned 1094 total results;
adding `daterange=1&sortmode=ListedDate` correctly narrowed it to same-day listings.

## Detail

The canonical job page is `https://www.seek.com.au/job/<id>`, but direct unauthenticated
fetches to it returned `HTTP 403` during testing — Seek appears to protect the full page
render differently from the search JSON API. `detail` in this CLI is therefore best-effort:
it attempts the fetch and reports a clear `BLOCKED` error with the direct URL if refused,
rather than a broken parser. Use the `search` command's `teaser`/`salary`/`workType` fields,
or open the URL manually, when `detail` is blocked.

## Notes

- No authentication required for `search`.
- Respect rate limits — keep personal-use volume low, same as this repo's `linkedin-search`.
