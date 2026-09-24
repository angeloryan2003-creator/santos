import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STATUS } from '@/lib/pontuacao';

export const runtime = 'nodejs';

/** Só o status é editável depois de criado. */
export async function PATCH(request: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;

  let status = '';
  try {
    const corpo = await request.json();
    status = typeof corpo?.status === 'string' ? corpo.status : '';
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }

  if (!(STATUS as readonly string[]).includes(status)) {
    return NextResponse.json({ erro: 'Status inválido.' }, { status: 400 });
  }

  const candidato = await prisma.candidato.findUnique({ where: { id } });
  if (!candidato) {
    return NextResponse.json({ erro: 'Candidato não encontrado.' }, { status: 404 });
  }

  if (candidato.antecedentes === 'Reprovada' && status !== 'Reprovado') {
    return NextResponse.json(
      {
        erro: 'Antecedentes reprovados. O status fica travado em Reprovado.',
      },
      { status: 409 },
    );
  }

  const atualizado = await prisma.candidato.update({ where: { id }, data: { status } });
  return NextResponse.json({ id: atualizado.id, status: atualizado.status });
}
