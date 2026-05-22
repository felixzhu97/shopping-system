import * as fs from 'fs'
import * as path from 'path'

export async function writeJsonLines(filePath: string, data: unknown[]): Promise<void> {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const lines = data.map((item) => JSON.stringify(item)).join('\n') + '\n'
  fs.writeFileSync(filePath, lines, 'utf8')
}
