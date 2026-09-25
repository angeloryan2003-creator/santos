import {
  ANTECEDENTES,
  CANAIS,
  CRITERIOS,
  FERRAMENTAS,
  STATUS,
  TREINAMENTO_NR,
  USO_EPI,
  VAGAS,
  calcularPontuacao,
  recomendar,
  type ChaveCriterio,
} from './pontuacao';
import { apenasDigitos } from './formato';

export type DadosCandidato = {
  nome: string;
  telefone: string;
  vaga: string;
  canal: string;
  cidade: string | null;
  experiencia: string;
  consistencia: string;
  empresasAnteriores: string | null;
  mobilidade: string;
  ferramentas: string;
  disponibilidade: string;
  pretensao: string;
  documentacao: string;
  referencias: string;
  antecedentes: string;
  usoEpi: string | null;
  treinamentoNr: string | null;
  trabalhoAltura: string | null;
  triador: string | null;
  observacoes: string | null;
  pontuacao: number;
  status: string;
};

export type ResultadoValidacao =
  | { ok: true; dados: DadosCandidato; mensagemId: string | null }
  | { ok: false; erros: string[] };

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

function opcional(valor: unknown): string | null {
  const t = texto(valor);
  return t.length > 0 ? t : null;
}

/** Campo de lista fechada que pode ficar em branco. */
function daLista(valor: unknown, lista: readonly string[]): string | null {
  const t = texto(valor);
  return lista.includes(t) ? t : null;
}

/**
 * Valida o payload da triagem e recalcula a pontuação no servidor.
 * O score enviado pelo navegador é ignorado de propósito.
 */
export function validarCandidato(corpo: Record<string, unknown>): ResultadoValidacao {
  const erros: string[] = [];

  const nome = texto(corpo.nome);
  if (nome.length < 2) erros.push('Informe o nome do candidato.');

  const telefoneBruto = texto(corpo.telefone);
  const digitos = apenasDigitos(telefoneBruto);
  if (digitos.length < 10 || digitos.length > 13) {
    erros.push('Informe um telefone válido com DDD.');
  }

  const vaga = texto(corpo.vaga);
  if (!(VAGAS as readonly string[]).includes(vaga)) erros.push('Selecione a vaga.');

  const canal = texto(corpo.canal);
  if (!(CANAIS as readonly string[]).includes(canal)) erros.push('Selecione o canal de origem.');

  const antecedentes = texto(corpo.antecedentes);
  if (!(ANTECEDENTES as readonly string[]).includes(antecedentes)) {
    erros.push('Selecione a situação da consulta de antecedentes.');
  }

  // Ferramentas saiu da régua, mas continua sendo registro obrigatório.
  const ferramentas = texto(corpo.ferramentas);
  if (!(FERRAMENTAS as readonly string[]).includes(ferramentas)) {
    erros.push('Selecione a situação das ferramentas próprias.');
  }

  const respostas = {} as Record<ChaveCriterio, string>;
  for (const criterio of CRITERIOS) {
    const valor = texto(corpo[criterio.chave]);
    if (!criterio.opcoes.some((o) => o.valor === valor)) {
      erros.push(`Selecione uma opção em "${criterio.rotulo}".`);
      continue;
    }
    respostas[criterio.chave] = valor;
  }

  if (erros.length > 0) return { ok: false, erros };

  const pontuacao = calcularPontuacao(respostas);
  const recomendacao = recomendar(pontuacao, antecedentes);

  const statusEnviado = texto(corpo.status);
  let status = (STATUS as readonly string[]).includes(statusEnviado)
    ? statusEnviado
    : recomendacao.statusSugerido;

  // Regra fixa: antecedentes reprovados vencem qualquer escolha manual.
  if (antecedentes === 'Reprovada') status = 'Reprovado';

  return {
    ok: true,
    mensagemId: opcional(corpo.mensagemId),
    dados: {
      nome,
      telefone: telefoneBruto,
      vaga,
      canal,
      cidade: opcional(corpo.cidade),
      experiencia: respostas.experiencia,
      consistencia: respostas.consistencia,
      empresasAnteriores: opcional(corpo.empresasAnteriores),
      mobilidade: respostas.mobilidade,
      ferramentas,
      disponibilidade: respostas.disponibilidade,
      pretensao: respostas.pretensao,
      documentacao: respostas.documentacao,
      referencias: respostas.referencias,
      antecedentes,
      usoEpi: daLista(corpo.usoEpi, USO_EPI),
      treinamentoNr: daLista(corpo.treinamentoNr, TREINAMENTO_NR),
      trabalhoAltura: respostas.trabalhoAltura,
      triador: opcional(corpo.triador),
      observacoes: opcional(corpo.observacoes),
      pontuacao,
      status,
    },
  };
}
