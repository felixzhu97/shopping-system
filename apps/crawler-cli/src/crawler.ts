import { fetchText, HttpOptions } from './http.js'
import { extractAttr, extractLinks, extractText, parsePrice } from './html.js'
import { ScrapedProduct, SourceConfig } from './types.js'

export type CrawlOptions = {
  concurrency: number
  requestTimeoutMs: number
}

export async function crawlSources(params: {
  sources: SourceConfig[]
  options: CrawlOptions
}): Promise<ScrapedProduct[]> {
  const { sources, options } = params
  const products: ScrapedProduct[] = []

  for (const source of sources) {
    const urls = await resolveProductUrls(source, options)
    const items = await mapWithConcurrency(urls, options.concurrency, async (url) =>
      scrapeProductPage(source.name, url, source.product, options)
    )
    for (const item of items) {
      if (item) products.push(item)
    }
  }

  return products
}

async function resolveProductUrls(source: SourceConfig, options: CrawlOptions): Promise<string[]> {
  const direct = Array.isArray(source.productPages) ? source.productPages : []
  const listPages = Array.isArray(source.listPages) ? source.listPages : []

  if (listPages.length === 0) {
    return dedupeUrls(direct)
  }

  const selector = source.itemLinkSelector ?? 'a'
  const attribute = source.itemLinkAttribute ?? 'href'
  const http: HttpOptions = { timeoutMs: options.requestTimeoutMs, userAgent: buildUserAgent() }
  const collected: string[] = []

  for (const listUrl of listPages) {
    const html = await fetchText(listUrl, http)
    const links = extractLinks({ html, baseUrl: listUrl, selector, attribute })
    for (const link of links) collected.push(link)
  }

  return dedupeUrls([...direct, ...collected])
}

async function scrapeProductPage(
  sourceName: string,
  url: string,
  selectors: SourceConfig['product'],
  options: CrawlOptions
): Promise<ScrapedProduct | undefined> {
  const http: HttpOptions = { timeoutMs: options.requestTimeoutMs, userAgent: buildUserAgent() }
  const html = await fetchText(url, http)
  const title = extractText(html, selectors.title)
  const priceText = extractText(html, selectors.price)
  const currency = extractText(html, selectors.currency)
  const imageUrl = extractAttr(html, selectors.image, 'src', url)
  const sku = extractText(html, selectors.sku)
  const availability = extractText(html, selectors.availability)
  const price = parsePrice(priceText)

  return {
    source: sourceName,
    url,
    title,
    price,
    currency,
    imageUrl,
    sku,
    availability,
    scrapedAt: new Date().toISOString()
  }
}

async function mapWithConcurrency<T, R>(
  input: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>
): Promise<R[]> {
  const limit = Math.max(1, Math.floor(concurrency))
  const results: R[] = new Array(input.length)
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (true) {
      const current = nextIndex
      nextIndex += 1
      if (current >= input.length) return
      results[current] = await mapper(input[current])
    }
  }

  const workers = Array.from({ length: Math.min(limit, input.length) }, () => worker())
  await Promise.all(workers)
  return results
}

function dedupeUrls(urls: string[]): string[] {
  const set = new Set<string>()
  for (const url of urls) {
    if (typeof url === 'string' && url.length > 0) set.add(url)
  }
  return Array.from(set)
}

function buildUserAgent(): string {
  return 'shopping-system-crawler/1.0'
}

