import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NOME_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const loja = await cookies();
  loja.set({
    name: NOME_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
