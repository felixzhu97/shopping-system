export type CrawlerConfig = {
  outputPath: string
  concurrency?: number
  requestTimeoutMs?: number
  sources: SourceConfig[]
}

export type SourceConfig = {
  name: string
  listPages?: string[]
  productPages?: string[]
  itemLinkSelector?: string
  itemLinkAttribute?: string
  product: ProductSelectors
}

export type ProductSelectors = {
  title?: string
  price?: string
  currency?: string
  image?: string
  sku?: string
  availability?: string
}

export type ScrapedProduct = {
  source: string
  url: string
  title?: string
  price?: number
  currency?: string
  imageUrl?: string
  sku?: string
  availability?: string
  scrapedAt: string
}
