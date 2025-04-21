import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://guczejbq56.execute-api.ap-east-1.amazonaws.com/dev/api';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const { searchParams } = new URL(request.url);

  // 构建查询字符串
  const queryString = Array.from(searchParams.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const apiUrl = `${API_BASE}/${path}${queryString ? `?${queryString}` : ''}`;

  console.log('代理转发请求到:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('代理请求失败:', error);
    return NextResponse.json({ error: '请求失败', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');

  try {
    const body = await request.json();
    const apiUrl = `${API_BASE}/${path}`;

    console.log('代理POST请求到:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('代理POST请求失败:', error);
    return NextResponse.json({ error: '请求失败', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');

  try {
    const body = await request.json();
    const apiUrl = `${API_BASE}/${path}`;

    console.log('代理PUT请求到:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('代理PUT请求失败:', error);
    return NextResponse.json({ error: '请求失败', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');

  try {
    const apiUrl = `${API_BASE}/${path}`;

    console.log('代理DELETE请求到:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('代理DELETE请求失败:', error);
    return NextResponse.json({ error: '请求失败', details: error.message }, { status: 500 });
  }
}
