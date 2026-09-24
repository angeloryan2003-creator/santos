import { NextResponse, type NextRequest } from 'next/server';
import { NOME_COOKIE, validarTokenSessao } from '@/lib/auth';

/**
 * Bloqueia todas as rotas, exceto o login e o webhook do WhatsApp
 * (o webhook é autenticado pelo verify token da Meta, não pelo cookie).
 */
const ROTAS_PUBLICAS = ['/login', '/api/login', '/api/webhook/whatsapp'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`))) {
    return NextResponse.next();
  }

  const autenticado = await validarTokenSessao(
    request.cookies.get(NOME_COOKIE)?.value,
    process.env.APP_PASSWORD,
  );

  if (autenticado) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ erro: 'Sessão expirada ou inválida.' }, { status: 401 });
  }

  const destino = request.nextUrl.clone();
  destino.pathname = '/login';
  destino.search = '';
  if (pathname !== '/') destino.searchParams.set('de', pathname);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
