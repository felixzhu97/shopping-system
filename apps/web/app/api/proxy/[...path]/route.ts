import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api';

// 设置CORS头部
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// 处理OPTIONS预检请求
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  // 确保路径正确处理，尤其是购物车路径
  const path = params.path ? params.path.join('/') : '';
  const { searchParams } = new URL(request.url);

  // 构建查询字符串
  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const apiUrl = `${API_BASE}/${path}${queryString ? `?${queryString}` : ''}`;

  console.log('代理转发请求到:', apiUrl);

  try {
    // 移除内容类型头，让浏览器自动处理
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        Origin: '*',
      },
      // 增加请求超时
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    // 可能不是所有响应都是JSON格式的
    try {
      const data = await response.json();
      const nextResponse = NextResponse.json(data);
      return setCorsHeaders(nextResponse);
    } catch (e) {
      // 如果不是JSON，则返回文本响应
      const text = await response.text();
      const textResponse = new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
      return setCorsHeaders(textResponse);
    }
  } catch (error: any) {
    console.error('代理请求失败:', error);
    const errorResponse = NextResponse.json(
      { error: '请求失败', details: error.message },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  try {
    let body: any;
    let contentType = request.headers.get('Content-Type') || 'application/json';

    // 根据内容类型处理请求体
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('text/plain')) {
      body = await request.text();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      body = {};
      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    } else {
      body = await request.text();
    }

    const apiUrl = `${API_BASE}/${path}`;
    console.log('代理POST请求到:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        Origin: '*',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    try {
      const data = await response.json();
      const nextResponse = NextResponse.json(data);
      return setCorsHeaders(nextResponse);
    } catch (e) {
      const text = await response.text();
      const textResponse = new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
      return setCorsHeaders(textResponse);
    }
  } catch (error: any) {
    console.error('代理POST请求失败:', error);
    const errorResponse = NextResponse.json(
      { error: '请求失败', details: error.message },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  try {
    let body: any;
    let contentType = request.headers.get('Content-Type') || 'application/json';

    // 根据内容类型处理请求体
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      body = await request.text();
    }

    const apiUrl = `${API_BASE}/${path}`;
    console.log('代理PUT请求到:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        Origin: '*',
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    try {
      const data = await response.json();
      const nextResponse = NextResponse.json(data);
      return setCorsHeaders(nextResponse);
    } catch (e) {
      const text = await response.text();
      const textResponse = new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
      return setCorsHeaders(textResponse);
    }
  } catch (error: any) {
    console.error('代理PUT请求失败:', error);
    const errorResponse = NextResponse.json(
      { error: '请求失败', details: error.message },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  try {
    const apiUrl = `${API_BASE}/${path}`;
    console.log('代理DELETE请求到:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Origin: '*',
      },
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    try {
      const data = await response.json();
      const nextResponse = NextResponse.json(data);
      return setCorsHeaders(nextResponse);
    } catch (e) {
      const text = await response.text();
      const textResponse = new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
      return setCorsHeaders(textResponse);
    }
  } catch (error: any) {
    console.error('代理DELETE请求失败:', error);
    const errorResponse = NextResponse.json(
      { error: '请求失败', details: error.message },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}
