import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

function getBaseUrl(): string {
  const baseUrl = process.env.CRAWLER_API_BASE_URL
  return baseUrl && baseUrl.length > 0 ? baseUrl : 'http://localhost:8000'
}

function buildTargetUrl(pathSegments: string[]): string {
  const baseUrl = getBaseUrl().replace(/\/+$/, '')
  const path = pathSegments.map((x) => encodeURIComponent(x)).join('/')
  return `${baseUrl}/${path}`
}

async function proxy(req: NextRequest, params: { path?: string[] }): Promise<Response> {
  const target = buildTargetUrl(params.path ?? [])
  const url = new URL(req.url)
  const targetUrl = new URL(target)
  targetUrl.search = url.search

  const headers = new Headers(req.headers)
  headers.delete('host')

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'follow'
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer()
  }

  const upstream = await fetch(targetUrl.toString(), init)
  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}

type RouteContext = { params: Promise<{ path?: string[] }> }

export async function GET(req: NextRequest, context: RouteContext) {
  return proxy(req, await context.params)
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxy(req, await context.params)
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxy(req, await context.params)
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxy(req, await context.params)
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxy(req, await context.params)
}

