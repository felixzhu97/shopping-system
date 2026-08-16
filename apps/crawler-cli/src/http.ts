import * as https from 'https'
import * as http from 'http'

export type HttpOptions = {
  timeoutMs?: number
  userAgent?: string
}

export async function fetchText(url: string, options: HttpOptions = {}): Promise<string> {
  const { timeoutMs = 30000, userAgent = 'explore-commerce-crawler/1.0' } = options

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.get(url, { headers: { 'User-Agent': userAgent }, timeout: timeoutMs }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(res.headers.location, options).then(resolve).catch(reject)
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timed out after ${timeoutMs}ms`))
    })
  })
}
