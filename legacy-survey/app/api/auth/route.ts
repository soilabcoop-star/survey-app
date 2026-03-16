import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? '');

    if (!token || token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login', detail: String(error) }, { status: 500 });
  }
}
