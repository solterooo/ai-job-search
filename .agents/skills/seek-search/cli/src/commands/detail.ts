import { writeError } from "../helpers.js"

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

function normalizeId(input: string): string | null {
  const url = input.match(/seek\.com\.au\/job\/(\d+)/)
  if (url) return url[1]
  const bare = input.match(/^\d+$/)
  if (bare) return input
  return null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const id = normalizeId(opts.id)
  if (!id) {
    writeError(`Could not parse a job ID from "${opts.id}"`, "BAD_ID")
    return 1
  }
  const url = `https://www.seek.com.au/job/${id}`
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html", Referer: "https://www.seek.com.au/jobs" },
    })
    if (!response.ok) {
      writeError(
        `Seek blocked direct access to the job page (status ${response.status}). Open it manually: ${url}`,
        "BLOCKED",
      )
      return 1
    }
    const html = await response.text()
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const result = {
      id,
      url,
      title: titleMatch ? titleMatch[1].trim() : null,
      note: "Full structured detail isn't reliably scrapable — use the search command's teaser/salary/workType fields, or open the URL above.",
    }
    if (opts.format === "plain") {
      process.stdout.write(`${result.title || "(title unavailable)"}\nURL: ${url}\n${result.note}\n`)
    } else {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
