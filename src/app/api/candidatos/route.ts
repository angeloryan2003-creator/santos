import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validarCandidato } from '@/lib/validacao';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let corpo: Record<string, unknown>;
  try {
    corpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }

  const resultado = validarCandidato(corpo);
  if (!resultado.ok) {
    return NextResponse.json({ erros: resultado.erros }, { status: 400 });
  }

  const candidato = await prisma.candidato.create({ data: resultado.dados });

  if (resultado.mensagemId) {
    await prisma.mensagemWhatsapp.updateMany({
      where: { id: resultado.mensagemId },
      data: { processada: true, candidatoId: candidato.id },
    });
  }

  return NextResponse.json(
    { id: candidato.id, pontuacao: candidato.pontuacao, status: candidato.status },
    { status: 201 },
  );
}
