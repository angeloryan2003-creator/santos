import Link from 'next/link';
import Cabecalho from '@/components/Cabecalho';
import ListaCandidatos from '@/components/ListaCandidatos';
import FiltrosPipeline from '@/components/FiltrosPipeline';
import { prisma } from '@/lib/prisma';
import { STATUS, VAGAS } from '@/lib/pontuacao';
import { apenasDigitos } from '@/lib/formato';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const EM_PROCESSO = ['Novo', 'Entrevista marcada', 'Teste prático'];

function primeiro(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] ?? '';
  return valor ?? '';
}

export default async function PaginaPipeline({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const vagaFiltro = primeiro(parametros.vaga);
  const statusFiltro = primeiro(parametros.status);
  const busca = primeiro(parametros.q).trim();

  const where: Prisma.CandidatoWhereInput = {};
  if ((VAGAS as readonly string[]).includes(vagaFiltro)) where.vaga = vagaFiltro;
  if ((STATUS as readonly string[]).includes(statusFiltro)) where.status = statusFiltro;

  if (busca) {
    const digitos = apenasDigitos(busca);
    where.OR = [
      { nome: { contains: busca, mode: 'insensitive' } },
      ...(digitos.length >= 3 ? [{ telefone: { contains: digitos } }] : []),
      { telefone: { contains: busca } },
    ];
  }

  const [candidatos, porStatus, total, mensagensNovas] = await Promise.all([
    prisma.candidato.findMany({
      where,
      orderBy: [{ pontuacao: 'desc' }, { criadoEm: 'desc' }],
      take: 300,
    }),
    prisma.candidato.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.candidato.count(),
    prisma.mensagemWhatsapp.count({ where: { processada: false } }),
  ]);

  const contagem = new Map(porStatus.map((linha) => [linha.status, linha._count._all]));
  const soma = (lista: string[]) =>
    lista.reduce((acumulado, status) => acumulado + (contagem.get(status) ?? 0), 0);

  const resumo = [
    { rotulo: 'Total de candidatos', valor: total, filtro: '' },
    { rotulo: 'Em processo', valor: soma(EM_PROCESSO), filtro: '' },
    { rotulo: 'Aprovados', valor: contagem.get('Aprovado') ?? 0, filtro: 'Aprovado' },
    {
      rotulo: 'Banco de reserva',
      valor: contagem.get('Banco de reserva') ?? 0,
      filtro: 'Banco de reserva',
    },
    { rotulo: 'Reprovados', valor: contagem.get('Reprovado') ?? 0, filtro: 'Reprovado' },
  ];

  return (
    <>
      <Cabecalho atual="/" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl">Pipeline de candidatos</h1>
            <p className="mt-1 text-sm text-cinza">
              Ordenado por pontuação, da maior para a menor. Clique no candidato para ver a
              triagem completa.
            </p>
          </div>
          <div className="flex gap-2">
            {mensagensNovas > 0 ? (
              <Link href="/whatsapp" className="botao-secundario">
                {mensagensNovas} mensagem{mensagensNovas > 1 ? 's' : ''} no WhatsApp
              </Link>
            ) : null}
            <Link href="/nova" className="botao-destaque">
              Nova triagem
            </Link>
          </div>
        </div>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {resumo.map((cartao) => (
            <Link
              key={cartao.rotulo}
              href={cartao.filtro ? `/?status=${encodeURIComponent(cartao.filtro)}` : '/'}
              className="cartao p-4 transition hover:border-azul/40 hover:shadow"
            >
              <p className="font-titulo text-3xl font-bold text-azul">{cartao.valor}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cinza">
                {cartao.rotulo}
              </p>
            </Link>
          ))}
        </section>

        <FiltrosPipeline vaga={vagaFiltro} status={statusFiltro} busca={busca} />

        <p className="mb-3 mt-6 text-sm text-cinza">
          {candidatos.length === 0
            ? 'Nenhum candidato encontrado com esses filtros.'
            : `${candidatos.length} candidato${candidatos.length > 1 ? 's' : ''} na lista.`}
        </p>

        <ListaCandidatos candidatos={candidatos} />
      </main>
    </>
  );
}
