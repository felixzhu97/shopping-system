import { NextRequest, NextResponse } from 'next/server';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

const handleError = async (response: Response) => {
  let errorText = '';
  let errorJson: any = null;
  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    try {
      errorJson = await response.json();
    } catch {
      errorJson = null;
    }
  } else {
    errorText = await response.text();
  }

  throw new Error(errorJson?.message || errorText || 'Request failed', {
    cause: { status: response.status },
  });
};

const setErrorResponse = (error: any) => {
  const errorResponse = NextResponse.json(
    {
      message: error.message,
    },
    { status: error?.cause?.status || 500 }
  );
  return setCorsHeaders(errorResponse);
};

const handleProxyResponse = async (response: Response) => {
  const contentType = response.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    return setCorsHeaders(nextResponse);
  }

  const text = await response.text();
  const textResponse = new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': contentType || 'text/plain',
    },
  });
  return setCorsHeaders(textResponse);
};

const parseRequestBody = async (
  request: NextRequest
): Promise<{ body: unknown; contentType: string }> => {
  const contentType = request.headers.get('Content-Type') || 'application/json';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    return { body, contentType };
  }

  if (contentType.includes('text/plain')) {
    const body = await request.text();
    return { body, contentType };
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const body: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }
    return { body, contentType };
  }

  const body = await request.text();
  return { body, contentType };
};

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  const { searchParams } = new URL(request.url);

  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const apiUrl = `${API_BASE}/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        Origin: '*',
        Authorization: request.headers.get('authorization') || '',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await handleProxyResponse(response);
  } catch (error: any) {
    return setErrorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  const path = params.path ? params.path.join('/') : '';

  try {
    const { body, contentType } = await parseRequestBody(request);
    const apiUrl = `${API_BASE}/${path}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        Origin: '*',
        Authorization: request.headers.get('authorization') || '',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await handleProxyResponse(response);
  } catch (error: any) {
    return setErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  try {
    const { body, contentType } = await parseRequestBody(request);
    const apiUrl = `${API_BASE}/${path}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        Origin: '*',
        Authorization: request.headers.get('authorization') || '',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await handleProxyResponse(response);
  } catch (error: any) {
    return setErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  try {
    const apiUrl = `${API_BASE}/${path}`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Origin: '*',
        Authorization: request.headers.get('authorization') || '',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await handleProxyResponse(response);
  } catch (error: any) {
    return setErrorResponse(error);
  }
}
