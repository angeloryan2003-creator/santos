import type { Prisma } from '@prisma/client';
import { STATUS, VAGAS } from './pontuacao';
import { apenasDigitos } from './formato';

export type FiltrosPipeline = { vaga: string; status: string; busca: string };

export function lerFiltros(
  parametros: Record<string, string | string[] | undefined> | URLSearchParams,
): FiltrosPipeline {
  const ler = (chave: string): string => {
    if (parametros instanceof URLSearchParams) return parametros.get(chave) ?? '';
    const valor = parametros[chave];
    return (Array.isArray(valor) ? valor[0] : valor) ?? '';
  };

  return {
    vaga: ler('vaga').trim(),
    status: ler('status').trim(),
    busca: ler('q').trim(),
  };
}

export function montarWhere({ vaga, status, busca }: FiltrosPipeline): Prisma.CandidatoWhereInput {
  const where: Prisma.CandidatoWhereInput = {};

  if ((VAGAS as readonly string[]).includes(vaga)) where.vaga = vaga;
  if ((STATUS as readonly string[]).includes(status)) where.status = status;

  if (busca) {
    const digitos = apenasDigitos(busca);
    where.OR = [
      { nome: { contains: busca, mode: 'insensitive' } },
      ...(digitos.length >= 3 ? [{ telefone: { contains: digitos } }] : []),
      { telefone: { contains: busca } },
    ];
  }

  return where;
}
