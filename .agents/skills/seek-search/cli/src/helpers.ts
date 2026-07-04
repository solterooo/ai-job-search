// Data source: Seek.com.au's public jobsearch/v5/search JSON API (used by Seek's own
// web search UI). No authentication required. Verified live 2026-07-04.

export const SEARCH_URL = "https://www.seek.com.au/api/jobsearch/v5/search"

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  salary: string | null
  workType: string | null
  teaser: string | null
  url: string
}

export interface SeekApiJob {
  id: string
  title: string
  companyName?: string
  advertiser?: { description?: string }
  locations?: { label?: string }[]
  listingDate?: string
  salaryLabel?: string
  workTypes?: string[]
  teaser?: string
}

export interface SeekApiResponse {
  data: SeekApiJob[]
  totalCount: number
}

export function mapJobCard(job: SeekApiJob): JobCard {
  return {
    id: job.id,
    title: job.title,
    company: job.companyName || job.advertiser?.description || null,
    location: job.locations?.[0]?.label ?? null,
    date: job.listingDate ?? null,
    salary: job.salaryLabel || null,
    workType: job.workTypes?.[0] ?? null,
    teaser: job.teaser ?? null,
    url: `https://www.seek.com.au/job/${job.id}`,
  }
}

export function parseSearchResponse(json: SeekApiResponse): { cards: JobCard[]; totalCount: number } {
  const cards = (json.data || []).map(mapJobCard)
  return { cards, totalCount: json.totalCount ?? cards.length }
}

export function daterangeToParam(days: number | undefined): string | null {
  if (!days || days <= 0 || days >= 9999) return null
  return String(days)
}

export interface SearchUrlOpts {
  query?: string
  location: string
  daterange?: number
  page: number
  format: "json" | "table" | "plain"
}

export function buildSearchUrl(opts: SearchUrlOpts): string {
  const params = new URLSearchParams()
  params.set("siteKey", "AU-Main")
  params.set("sourcesystem", "houston")
  if (opts.query) params.set("keywords", opts.query)
  params.set("where", opts.location)
  const dr = daterangeToParam(opts.daterange)
  if (dr) {
    params.set("daterange", dr)
    params.set("sortmode", "ListedDate")
  }
  params.set("page", String(opts.page))
  params.set("pageSize", "20")
  return `${SEARCH_URL}?${params.toString()}`
}

/** Fetch JSON with exponential backoff on 429/5xx. Non-2xx otherwise returns status with null json. */
export async function apiFetch(url: string): Promise<{ status: number; json: SeekApiResponse | null }> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (!response.ok) {
      return { status: response.status, json: null }
    }
    return { status: response.status, json: (await response.json()) as SeekApiResponse }
  }
  throw new Error("Request failed after max retries")
}
