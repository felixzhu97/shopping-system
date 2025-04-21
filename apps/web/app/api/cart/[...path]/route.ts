import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://guczejbq56.execute-api.ap-east-1.amazonaws.com/dev/api/cart';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  const { searchParams } = new URL(request.url);

  // 构建查询字符串
  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  // 构建完整URL
  const apiUrl = `${API_BASE}/${path}${queryString ? `?${queryString}` : ''}`;
  console.log('购物车代理转发GET请求到:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`购物车API请求失败: ${response.status}`);
    }

    // 尝试获取JSON响应
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (e) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
    }
  } catch (error: any) {
    console.error('购物车代理请求失败:', error);
    return NextResponse.json({ error: '购物车请求失败', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  try {
    const body = await request.json();
    const apiUrl = `${API_BASE}/${path}`;
    console.log('购物车代理转发POST请求到:', apiUrl, 'body:', body);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`购物车API请求失败: ${response.status}`);
    }

    // 尝试获取JSON响应
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (e) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
    }
  } catch (error: any) {
    console.error('购物车代理POST请求失败:', error);
    return NextResponse.json({ error: '购物车请求失败', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  try {
    const body = await request.json();
    const apiUrl = `${API_BASE}/${path}`;
    console.log('购物车代理转发PUT请求到:', apiUrl, 'body:', body);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`购物车API请求失败: ${response.status}`);
    }

    // 尝试获取JSON响应
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (e) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
    }
  } catch (error: any) {
    console.error('购物车代理PUT请求失败:', error);
    return NextResponse.json({ error: '购物车请求失败', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';

  const apiUrl = `${API_BASE}/${path}`;
  console.log('购物车代理转发DELETE请求到:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`购物车API请求失败: ${response.status}`);
    }

    // 尝试获取JSON响应
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (e) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'text/plain',
        },
      });
    }
  } catch (error: any) {
    console.error('购物车代理DELETE请求失败:', error);
    return NextResponse.json({ error: '购物车请求失败', details: error.message }, { status: 500 });
  }
}
