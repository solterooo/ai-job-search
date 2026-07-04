import { describe, expect, test } from "bun:test"
import { parseSearchResponse, buildSearchUrl, daterangeToParam } from "../src/helpers.js"
import fixture from "./fixtures/search-response.json"

describe("parseSearchResponse", () => {
  test("maps API jobs to JobCard shape", () => {
    const { cards, totalCount } = parseSearchResponse(fixture as any)
    expect(totalCount).toBe(1094)
    expect(cards).toHaveLength(2)
    expect(cards[0]).toEqual({
      id: "92986687",
      title: "Waiters / Bar Staff | New Perth Openings in Sales",
      company: "Private Advertiser",
      location: "Perth WA",
      date: "2026-06-28T00:41:47Z",
      salary: "$33 – $35/hr + bonuses",
      workType: "Casual/Vacation",
      teaser: "Sick of the goundhog day that is hospitality? Business minded? Switch to sales and develop fast.",
      url: "https://www.seek.com.au/job/92986687",
    })
  })

  test("falls back to null salary when salaryLabel is empty", () => {
    const { cards } = parseSearchResponse(fixture as any)
    expect(cards[1].salary).toBeNull()
  })
})

describe("daterangeToParam", () => {
  test("returns the day count as a string", () => {
    expect(daterangeToParam(7)).toBe("7")
  })
  test("returns null for 0, undefined, or >= 9999", () => {
    expect(daterangeToParam(0)).toBeNull()
    expect(daterangeToParam(undefined)).toBeNull()
    expect(daterangeToParam(9999)).toBeNull()
  })
})

describe("buildSearchUrl", () => {
  test("includes keywords, where, page, and pageSize", () => {
    const url = buildSearchUrl({ query: "hospitality", location: "Perth WA", page: 1, format: "json" })
    expect(url).toContain("keywords=hospitality")
    expect(url).toContain("where=Perth+WA")
    expect(url).toContain("page=1")
    expect(url).toContain("pageSize=20")
    expect(url).not.toContain("daterange")
  })

  test("adds daterange and sortmode when daterange is set", () => {
    const url = buildSearchUrl({ location: "Perth WA", page: 1, daterange: 1, format: "json" })
    expect(url).toContain("daterange=1")
    expect(url).toContain("sortmode=ListedDate")
  })
})
