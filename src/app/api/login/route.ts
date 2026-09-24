import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  DURACAO_SESSAO_SEGUNDOS,
  NOME_COOKIE,
  compararSeguro,
  criarTokenSessao,
} from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Freio simples contra tentativa em massa na senha compartilhada.
 * Vive na memória da instância, some em um deploy novo. Não é uma defesa
 * completa, é só pra tornar chute em volume inviável no uso normal.
 */
const JANELA_MS = 10 * 60 * 1000;
const LIMITE_TENTATIVAS = 10;
const tentativas = new Map<string, { contador: number; inicio: number }>();

function excedeuLimite(chave: string): boolean {
  const agora = Date.now();
  const registro = tentativas.get(chave);
  if (!registro || agora - registro.inicio > JANELA_MS) {
    tentativas.set(chave, { contador: 1, inicio: agora });
    return false;
  }
  registro.contador += 1;
  return registro.contador > LIMITE_TENTATIVAS;
}

export async function POST(request: Request) {
  const senhaEsperada = process.env.APP_PASSWORD;
  if (!senhaEsperada) {
    return NextResponse.json(
      { erro: 'APP_PASSWORD não configurada no servidor.' },
      { status: 500 },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'desconhecido';

  if (excedeuLimite(ip)) {
    return NextResponse.json(
      { erro: 'Muitas tentativas. Espere alguns minutos e tente de novo.' },
      { status: 429 },
    );
  }

  let senha = '';
  try {
    const corpo = await request.json();
    senha = typeof corpo?.senha === 'string' ? corpo.senha : '';
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }

  if (!senha || !compararSeguro(senha, senhaEsperada)) {
    return NextResponse.json({ erro: 'Senha incorreta.' }, { status: 401 });
  }

  tentativas.delete(ip);

  const loja = await cookies();
  loja.set({
    name: NOME_COOKIE,
    value: await criarTokenSessao(senhaEsperada),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });

  return NextResponse.json({ ok: true });
}
