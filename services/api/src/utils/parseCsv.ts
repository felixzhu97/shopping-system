export type ParsedCsvRow = {
  rowNumber: number;
  values: Record<string, string>;
};

function normalizeHeaderKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      cells.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  cells.push(current);
  return cells.map(v => v.trim());
}

export function parseCsvToRows(csvText: string): { headers: string[]; rows: ParsedCsvRow[] } {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = parseCsvLine(lines[0]);
  const headers = rawHeaders.map(h => h.trim());

  const rows: ParsedCsvRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j += 1) {
      const key = headers[j] ?? '';
      if (!key) continue;
      obj[normalizeHeaderKey(key)] = values[j] ?? '';
    }
    rows.push({ rowNumber: i + 1, values: obj });
  }

  return { headers: headers.map(normalizeHeaderKey), rows };
}

export function mapNormalizedKey(
  row: Record<string, string>,
  keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = row[normalizeHeaderKey(k)];
    if (v !== undefined) return v;
  }
  return undefined;
}
