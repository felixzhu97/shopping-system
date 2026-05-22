import * as cheerio from 'cheerio'

export function extractText(html: string, selector: string | undefined): string {
  if (!selector) return ''
  const $ = cheerio.load(html)
  return $(selector).first().text().trim() || ''
}

export function extractAttr(
  html: string,
  selector: string | undefined,
  attribute: string,
  baseUrl?: string
): string {
  if (!selector) return ''
  const $ = cheerio.load(html)
  let value = $(selector).first().attr(attribute) || ''
  if (baseUrl && value && !value.startsWith('http')) {
    try {
      value = new URL(value, baseUrl).href
    } catch {
      // keep as-is
    }
  }
  return value
}

export function extractLinks(params: {
  html: string
  baseUrl: string
  selector?: string
  attribute?: string
}): string[] {
  const { html, baseUrl, selector = 'a', attribute = 'href' } = params
  const $ = cheerio.load(html)
  const links: string[] = []
  $(selector).each((_, el) => {
    const href = $(el).attr(attribute)
    if (href) {
      try {
        links.push(new URL(href, baseUrl).href)
      } catch {
        links.push(href)
      }
    }
  })
  return links
}

export function parsePrice(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}
