import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STATUS, TRIADORES } from '@/lib/pontuacao';
import { validarCandidato } from '@/lib/validacao';

export const runtime = 'nodejs';

function autorValido(valor: unknown): string | null {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  return (TRIADORES as readonly string[]).includes(texto) ? texto : null;
}

/** Detalhe do candidato com o histórico de mudanças de status. */
export async function GET(request: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;

  const candidato = await prisma.candidato.findUnique({
    where: { id },
    include: { historico: { orderBy: { criadoEm: 'desc' } } },
  });

  if (!candidato) {
    return NextResponse.json({ erro: 'Candidato não encontrado.' }, { status: 404 });
  }

  return NextResponse.json(candidato);
}

/** Troca rápida de status a partir da lista do pipeline. */
export async function PATCH(request: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;

  let status = '';
  let autor: string | null = null;
  try {
    const corpo = await request.json();
    status = typeof corpo?.status === 'string' ? corpo.status : '';
    autor = autorValido(corpo?.autor);
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
      { erro: 'Antecedentes reprovados. O status fica travado em Reprovado.' },
      { status: 409 },
    );
  }

  if (candidato.status === status) {
    return NextResponse.json({ id: candidato.id, status: candidato.status });
  }

  const [atualizado] = await prisma.$transaction([
    prisma.candidato.update({ where: { id }, data: { status } }),
    prisma.alteracaoStatus.create({
      data: { candidatoId: id, de: candidato.status, para: status, autor },
    }),
  ]);

  return NextResponse.json({ id: atualizado.id, status: atualizado.status });
}

/** Edição completa da triagem, com recálculo da pontuação no servidor. */
export async function PUT(request: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;

  let corpo: Record<string, unknown>;
  try {
    corpo = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ erro: 'Requisição inválida.' }, { status: 400 });
  }

  const candidato = await prisma.candidato.findUnique({ where: { id } });
  if (!candidato) {
    return NextResponse.json({ erro: 'Candidato não encontrado.' }, { status: 404 });
  }

  const resultado = validarCandidato(corpo);
  if (!resultado.ok) {
    return NextResponse.json({ erros: resultado.erros }, { status: 400 });
  }

  const autor = autorValido(corpo.autor);
  const statusAnterior = candidato.status;
  const dados = resultado.dados;

  const atualizado = await prisma.$transaction(async (tx) => {
    const registro = await tx.candidato.update({ where: { id }, data: dados });

    if (statusAnterior !== dados.status) {
      await tx.alteracaoStatus.create({
        data: { candidatoId: id, de: statusAnterior, para: dados.status, autor },
      });
    }

    return registro;
  });

  return NextResponse.json({
    id: atualizado.id,
    pontuacao: atualizado.pontuacao,
    status: atualizado.status,
  });
}

/** Exclusão definitiva, usada para atender pedido de remoção de dados. */
export async function DELETE(request: Request, contexto: { params: Promise<{ id: string }> }) {
  const { id } = await contexto.params;

  const candidato = await prisma.candidato.findUnique({ where: { id } });
  if (!candidato) {
    return NextResponse.json({ erro: 'Candidato não encontrado.' }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.mensagemWhatsapp.updateMany({
      where: { candidatoId: id },
      data: { candidatoId: null, processada: false },
    }),
    prisma.candidato.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
