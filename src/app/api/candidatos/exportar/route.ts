import { prisma } from '@/lib/prisma';
import { lerFiltros, montarWhere } from '@/lib/filtros';
import { formatarDataHora } from '@/lib/formato';

export const runtime = 'nodejs';

const COLUNAS = [
  'Nome',
  'Telefone',
  'Vaga',
  'Canal',
  'Cidade',
  'Pontuação',
  'Status',
  'Experiência',
  'Consistência',
  'Mobilidade',
  'Ferramentas',
  'Documentação',
  'Referências',
  'Disponibilidade',
  'Pretensão',
  'Antecedentes',
  'Uso de EPI',
  'Treinamento NR',
  'Trabalho em altura',
  'Empresas anteriores',
  'Triador',
  'Observações',
  'Criado em',
  'Atualizado em',
];

function celula(valor: unknown): string {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

/** Exporta o pipeline filtrado em CSV, separador ponto e vírgula para o Excel pt-BR. */
export async function GET(request: Request) {
  const filtros = lerFiltros(new URL(request.url).searchParams);

  const candidatos = await prisma.candidato.findMany({
    where: montarWhere(filtros),
    orderBy: [{ pontuacao: 'desc' }, { criadoEm: 'desc' }],
  });

  const linhas = candidatos.map((c) =>
    [
      c.nome,
      c.telefone,
      c.vaga,
      c.canal,
      c.cidade,
      c.pontuacao,
      c.status,
      c.experiencia,
      c.consistencia,
      c.mobilidade,
      c.ferramentas,
      c.documentacao,
      c.referencias,
      c.disponibilidade,
      c.pretensao,
      c.antecedentes,
      c.usoEpi,
      c.treinamentoNr,
      c.trabalhoAltura,
      c.empresasAnteriores,
      c.triador,
      c.observacoes,
      formatarDataHora(c.criadoEm),
      formatarDataHora(c.atualizadoEm),
    ]
      .map(celula)
      .join(';'),
  );

  const csv = [COLUNAS.map(celula).join(';'), ...linhas].join('\r\n');
  const data = new Date().toISOString().slice(0, 10);

  // BOM para o Excel abrir os acentos corretamente.
  return new Response(`﻿${csv}`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="triagem-angelo-pinturas-${data}.csv"`,
    },
  });
}
