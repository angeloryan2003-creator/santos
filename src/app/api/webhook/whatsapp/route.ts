import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook do WhatsApp Business (Meta Cloud API), fase 1: só recebimento.
 * Nada é respondido ou pontuado automaticamente.
 *
 * GET  -> responde ao desafio de verificação da Meta.
 * POST -> extrai telefone e texto das mensagens e salva em MensagemWhatsapp.
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const modo = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const desafio = url.searchParams.get('hub.challenge') ?? '';

  const esperado = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!esperado) {
    return new NextResponse('WHATSAPP_VERIFY_TOKEN não configurada.', { status: 500 });
  }

  if (modo === 'subscribe' && token === esperado) {
    return new NextResponse(desafio, {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });
  }

  return new NextResponse('Verificação recusada.', { status: 403 });
}

/** Confere a assinatura da Meta quando WHATSAPP_APP_SECRET estiver configurada. */
function assinaturaValida(corpoBruto: string, cabecalho: string | null): boolean {
  const segredo = process.env.WHATSAPP_APP_SECRET;
  if (!segredo) return true; // verificação opcional, ver README
  if (!cabecalho?.startsWith('sha256=')) return false;

  const esperado = crypto.createHmac('sha256', segredo).update(corpoBruto).digest('hex');
  const recebido = cabecalho.slice('sha256='.length);
  const a = Buffer.from(esperado, 'utf8');
  const b = Buffer.from(recebido, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

type MensagemExtraida = { telefone: string; corpo: string; recebidaEm: Date };

/** Texto legível para cada tipo de mensagem que a Meta entrega. */
function corpoDaMensagem(mensagem: Record<string, any>): string {
  switch (mensagem.type) {
    case 'text':
      return mensagem.text?.body ?? '';
    case 'button':
      return mensagem.button?.text ?? '[botão]';
    case 'interactive':
      return (
        mensagem.interactive?.button_reply?.title ??
        mensagem.interactive?.list_reply?.title ??
        '[resposta interativa]'
      );
    case 'image':
      return mensagem.image?.caption ? `[imagem] ${mensagem.image.caption}` : '[imagem]';
    case 'audio':
      return '[áudio]';
    case 'video':
      return mensagem.video?.caption ? `[vídeo] ${mensagem.video.caption}` : '[vídeo]';
    case 'document':
      return `[documento] ${mensagem.document?.filename ?? ''}`.trim();
    case 'location':
      return '[localização]';
    case 'contacts':
      return '[contato]';
    default:
      return `[${mensagem.type ?? 'mensagem não suportada'}]`;
  }
}

function extrairMensagens(carga: any): MensagemExtraida[] {
  const extraidas: MensagemExtraida[] = [];

  for (const entrada of carga?.entry ?? []) {
    for (const mudanca of entrada?.changes ?? []) {
      for (const mensagem of mudanca?.value?.messages ?? []) {
        const telefone = String(mensagem?.from ?? '').trim();
        if (!telefone) continue;

        const segundos = Number(mensagem?.timestamp);
        const recebidaEm = Number.isFinite(segundos) ? new Date(segundos * 1000) : new Date();

        extraidas.push({
          telefone,
          corpo: corpoDaMensagem(mensagem) || '[mensagem sem texto]',
          recebidaEm,
        });
      }
    }
  }

  return extraidas;
}

export async function POST(request: Request) {
  const corpoBruto = await request.text();

  if (!assinaturaValida(corpoBruto, request.headers.get('x-hub-signature-256'))) {
    return new NextResponse('Assinatura inválida.', { status: 401 });
  }

  let carga: unknown;
  try {
    carga = JSON.parse(corpoBruto);
  } catch {
    return NextResponse.json({ erro: 'JSON inválido.' }, { status: 400 });
  }

  const mensagens = extrairMensagens(carga);

  for (const mensagem of mensagens) {
    // A Meta reenvia o webhook quando não recebe 200 rápido.
    // Sem campo pro id da Meta no modelo, a defesa é uma janela curta
    // de mesmo telefone e mesmo texto.
    const duplicada = await prisma.mensagemWhatsapp.findFirst({
      where: {
        telefone: mensagem.telefone,
        corpo: mensagem.corpo,
        recebidaEm: { gte: new Date(mensagem.recebidaEm.getTime() - 2 * 60 * 1000) },
      },
      select: { id: true },
    });
    if (duplicada) continue;

    await prisma.mensagemWhatsapp.create({ data: mensagem });
  }

  // Sempre 200: a Meta desativa o webhook se receber erro com frequência.
  return NextResponse.json({ recebidas: mensagens.length });
}
