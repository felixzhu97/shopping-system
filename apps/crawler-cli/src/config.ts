import fs from 'node:fs/promises'
import path from 'node:path'
import { CrawlerConfig } from './types.js'

export type CliOptions = {
  configPath: string
  outputPath?: string
}

export function parseCliOptions(argv: string[]): CliOptions {
  const args = argv.slice(2)
  const configIndex = args.indexOf('--config')
  const configPath = configIndex >= 0 ? args[configIndex + 1] : process.env.CRAWLER_CONFIG
  if (!configPath) {
    throw new Error('Missing --config or CRAWLER_CONFIG')
  }

  const outputIndex = args.indexOf('--output')
  const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : undefined
  return { configPath, outputPath }
}

export async function readCrawlerConfig(configPath: string): Promise<CrawlerConfig> {
  const absolutePath = path.isAbsolute(configPath) ? configPath : path.join(process.cwd(), configPath)
  const raw = await fs.readFile(absolutePath, 'utf8')
  const parsed = JSON.parse(raw) as CrawlerConfig

  if (!parsed.outputPath || typeof parsed.outputPath !== 'string') {
    throw new Error('Invalid config: outputPath is required')
  }
  if (!Array.isArray(parsed.sources) || parsed.sources.length === 0) {
    throw new Error('Invalid config: sources is required')
  }
  return parsed
}
