import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/** Marca ou desmarca uma mensagem como processada, sem criar triagem. */
export async function PATCH(request: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;

  let processada: boolean | null = null;
  try {
    const corpo = await request.json();
    if (typeof corpo?.processada === 'boolean') processada = corpo.processada;
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }

  if (processada === null) {
    return NextResponse.json({ erro: 'Campo "processada" é obrigatório.' }, { status: 400 });
  }

  const resultado = await prisma.mensagemWhatsapp.updateMany({
    where: { id },
    data: { processada },
  });

  if (resultado.count === 0) {
    return NextResponse.json({ erro: 'Mensagem não encontrada.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, processada });
}
