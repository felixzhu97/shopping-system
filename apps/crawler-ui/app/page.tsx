'use client'

import { useMemo, useState } from 'react'

type JobView = {
  id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  count: number
  error?: string | null
}

type JobItemsView = {
  id: string
  status: JobView['status']
  items: unknown[]
  meta?: Record<string, unknown>
}

function defaultRequestBody(): string {
  return JSON.stringify(
    {
      concurrency: 4,
      request_timeout_ms: 20000,
      sources: [
        {
          name: 'example-store',
          list_pages: ['https://example.com/products'],
          item_link_selector: 'a',
          item_link_attribute: 'href',
          product: { title: 'h1', price: '.price', image: 'img' }
        }
      ]
    },
    null,
    2
  )
}

export default function Page() {
  const [requestBody, setRequestBody] = useState(defaultRequestBody)
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<JobView | null>(null)
  const [items, setItems] = useState<JobItemsView | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiBase = useMemo(() => '/api/crawler', [])

  async function createJob() {
    setBusy(true)
    setError(null)
    setItems(null)
    try {
      const parsed = JSON.parse(requestBody)
      const res = await fetch(`${apiBase}/crawler/jobs`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed)
      })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as JobView
      setJobId(data.id)
      setJob(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function refreshJob() {
    if (!jobId) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/crawler/jobs/${encodeURIComponent(jobId)}`, { method: 'GET' })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as JobView
      setJob(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function fetchItems() {
    if (!jobId) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase}/crawler/jobs/${encodeURIComponent(jobId)}/items`, { method: 'GET' })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as JobItemsView
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Crawler UI</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={createJob}
              disabled={busy}
              className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
            >
              Create job
            </button>
            <button
              type="button"
              onClick={refreshJob}
              disabled={busy || !jobId}
              className="rounded-md border px-4 py-2 disabled:opacity-60"
            >
              Refresh status
            </button>
            <button
              type="button"
              onClick={fetchItems}
              disabled={busy || !jobId}
              className="rounded-md border px-4 py-2 disabled:opacity-60"
            >
              Fetch items
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="mb-2 text-sm font-medium">Request body (JSON)</div>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              spellCheck={false}
              className="h-[420px] w-full resize-none rounded-md border bg-transparent p-3 font-mono text-xs"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              The UI proxies requests through <span className="font-mono">{apiBase}</span>. Set{' '}
              <span className="font-mono">CRAWLER_API_BASE_URL</span> for the Next server if needed.
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <div className="mb-2 text-sm font-medium">Job</div>
              <div className="grid gap-2 text-sm">
                <label className="grid gap-1">
                  <span className="text-xs text-muted-foreground">Job ID</span>
                  <input
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="Paste a job id"
                    className="w-full rounded-md border bg-transparent px-3 py-2"
                  />
                </label>
                <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                  {job ? JSON.stringify(job, null, 2) : 'No job yet'}
                </pre>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="mb-2 text-sm font-medium">Items</div>
              <pre className="h-[260px] overflow-auto rounded-md bg-muted p-3 text-xs">
                {items ? JSON.stringify(items, null, 2) : 'No items yet'}
              </pre>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}

