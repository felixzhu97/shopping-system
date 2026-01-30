import { crawlSources } from './crawler.js'
import { parseCliOptions, readCrawlerConfig } from './config.js'
import { writeJsonLines } from './output.js'

async function main(): Promise<void> {
  const { configPath, outputPath } = parseCliOptions(process.argv)
  const config = await readCrawlerConfig(configPath)
  const products = await crawlSources({
    sources: config.sources,
    options: {
      concurrency: config.concurrency ?? 4,
      requestTimeoutMs: config.requestTimeoutMs ?? 20000
    }
  })

  await writeJsonLines(outputPath ?? config.outputPath, products)
  process.stdout.write(JSON.stringify({ count: products.length }) + '\n')
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err)
  process.stderr.write(message + '\n')
  process.exitCode = 1
})

