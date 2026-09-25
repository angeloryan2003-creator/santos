'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { Candidato } from '@prisma/client';
import {
  ANTECEDENTES,
  CANAIS,
  CRITERIOS,
  STATUS,
  TRABALHO_ALTURA,
  TREINAMENTO_NR,
  TRIADORES,
  USO_EPI,
  VAGAS,
  alertasSeguranca,
  calcularPontuacao,
  pontosDoCriterio,
  recomendar,
  type ChaveCriterio,
} from '@/lib/pontuacao';
import { useOperador } from '@/lib/operador';

type Formulario = Record<string, string>;

const VAZIO: Formulario = {
  nome: '',
  telefone: '',
  vaga: '',
  canal: '',
  cidade: '',
  triador: '',
  empresasAnteriores: '',
  antecedentes: 'Pendente',
  usoEpi: '',
  treinamentoNr: '',
  trabalhoAltura: '',
  observacoes: '',
  status: '',
  experiencia: '',
  consistencia: '',
  mobilidade: '',
  ferramentas: '',
  documentacao: '',
  referencias: '',
  disponibilidade: '',
  pretensao: '',
};

const CORES_TOM: Record<string, string> = {
  verde: 'bg-emerald-600 text-white',
  azul: 'bg-azul text-white',
  amarelo: 'bg-amarelo text-azul',
  cinza: 'bg-cinza text-white',
  vermelho: 'bg-red-600 text-white',
};

function doCandidato(candidato: Candidato): Formulario {
  const dados: Formulario = { ...VAZIO };
  for (const chave of Object.keys(VAZIO)) {
    const valor = (candidato as unknown as Record<string, unknown>)[chave];
    dados[chave] = typeof valor === 'string' ? valor : '';
  }
  return dados;
}

export default function FormularioTriagem({ candidato }: { candidato?: Candidato }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const [operador] = useOperador();

  const edicao = Boolean(candidato);
  const telefoneInicial = parametros.get('telefone') ?? '';
  const observacaoInicial = parametros.get('obs') ?? '';
  const mensagemId = parametros.get('mensagemId') ?? '';

  const [dados, setDados] = useState<Formulario>(
    candidato
      ? doCandidato(candidato)
      : {
          ...VAZIO,
          telefone: telefoneInicial,
          observacoes: observacaoInicial,
          canal: telefoneInicial ? 'WhatsApp direto' : '',
        },
  );
  const [erros, setErros] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [statusTocado, setStatusTocado] = useState(edicao);

  const pontuacao = useMemo(
    () => calcularPontuacao(dados as Partial<Record<ChaveCriterio, string>>),
    [dados],
  );
  const recomendacao = useMemo(
    () => recomendar(pontuacao, dados.antecedentes),
    [pontuacao, dados.antecedentes],
  );
  const alertas = useMemo(() => alertasSeguranca(dados), [dados]);

  // Enquanto a equipe não mexer no status, ele acompanha a recomendação.
  useEffect(() => {
    if (statusTocado && dados.antecedentes !== 'Reprovada') return;
    setDados((atual) =>
      atual.status === recomendacao.statusSugerido
        ? atual
        : { ...atual, status: recomendacao.statusSugerido },
    );
  }, [recomendacao.statusSugerido, statusTocado, dados.antecedentes]);

  // Numa triagem nova, quem está usando o sistema já entra como triador.
  useEffect(() => {
    if (edicao || !operador) return;
    setDados((atual) => (atual.triador ? atual : { ...atual, triador: operador }));
  }, [operador, edicao]);

  function alterar(campo: string, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErros([]);
    setEnviando(true);

    try {
      const resposta = await fetch(
        edicao ? `/api/candidatos/${candidato!.id}` : '/api/candidatos',
        {
          method: edicao ? 'PUT' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            ...dados,
            autor: operador || undefined,
            mensagemId: mensagemId || undefined,
          }),
        },
      );

      const corpo = await resposta.json().catch(() => ({}));

      if (!resposta.ok) {
        setErros(corpo.erros ?? [corpo.erro ?? 'Não foi possível salvar a triagem.']);
        setEnviando(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setErros(['Falha de conexão ao salvar. Tente de novo.']);
      setEnviando(false);
    }
  }

  const antecedentesReprovados = dados.antecedentes === 'Reprovada';

  return (
    <form onSubmit={enviar} className="space-y-6">
      {erros.length > 0 ? (
        <div className="rounded-md border-l-4 border-red-600 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-800">Corrija antes de salvar:</p>
          <ul className="mt-1 list-inside list-disc text-sm text-red-800">
            {erros.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="cartao p-5">
        <h2 className="mb-4 text-base uppercase tracking-wide">Dados do candidato</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Texto
            id="nome"
            rotulo="Nome completo"
            valor={dados.nome}
            aoMudar={(v) => alterar('nome', v)}
            obrigatorio
          />
          <Texto
            id="telefone"
            rotulo="Telefone com DDD"
            valor={dados.telefone}
            aoMudar={(v) => alterar('telefone', v)}
            obrigatorio
            placeholder="11 98888-7777"
          />
          <Selecao
            id="vaga"
            rotulo="Vaga"
            valor={dados.vaga}
            opcoes={[...VAGAS]}
            aoMudar={(v) => alterar('vaga', v)}
            obrigatorio
          />
          <Selecao
            id="canal"
            rotulo="Canal de origem"
            valor={dados.canal}
            opcoes={[...CANAIS]}
            aoMudar={(v) => alterar('canal', v)}
            obrigatorio
          />
          <Texto
            id="cidade"
            rotulo="Cidade ou bairro"
            valor={dados.cidade}
            aoMudar={(v) => alterar('cidade', v)}
            placeholder="Barueri, Jardim Silveira"
          />
          <Selecao
            id="triador"
            rotulo="Quem triou"
            valor={dados.triador}
            opcoes={[...TRIADORES]}
            aoMudar={(v) => alterar('triador', v)}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="empresasAnteriores" className="rotulo">
            Empresas anteriores
          </label>
          <input
            id="empresasAnteriores"
            className="campo"
            value={dados.empresasAnteriores}
            onChange={(e) => alterar('empresasAnteriores', e.target.value)}
            placeholder="Onde trabalhou e por quanto tempo"
          />
        </div>
      </section>

      <section className="cartao p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-base uppercase tracking-wide">Critérios de pontuação</h2>
          <span className="font-titulo text-sm font-bold text-azul">{pontuacao} / 100</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {CRITERIOS.map((criterio) => {
            const valor = dados[criterio.chave] ?? '';
            const pontos = pontosDoCriterio(criterio.chave, valor);
            return (
              <div key={criterio.chave}>
                <label htmlFor={criterio.chave} className="rotulo flex justify-between gap-2">
                  <span>
                    {criterio.rotulo}
                    <span className="ml-1 font-normal text-cinza">(peso {criterio.peso})</span>
                  </span>
                  {valor ? (
                    <span className="shrink-0 rounded bg-azul/10 px-1.5 text-xs text-azul">
                      +{pontos}
                    </span>
                  ) : null}
                </label>
                <select
                  id={criterio.chave}
                  className="campo"
                  value={valor}
                  onChange={(e) => alterar(criterio.chave, e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {criterio.opcoes.map((opcao) => (
                    <option key={opcao.valor} value={opcao.valor}>
                      {opcao.valor} ({opcao.pontos})
                    </option>
                  ))}
                </select>
                {criterio.ajuda ? (
                  <p className="mt-1 text-xs text-cinza">{criterio.ajuda}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="cartao p-5">
        <h2 className="mb-1 text-base uppercase tracking-wide">Segurança do trabalho</h2>
        <p className="mb-4 text-xs text-cinza">
          Não entra na pontuação. Serve de alerta, porque fachada e andaime são trabalho em
          altura e exigem NR-35.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Selecao
            id="usoEpi"
            rotulo="Já usou EPI"
            valor={dados.usoEpi}
            opcoes={[...USO_EPI]}
            aoMudar={(v) => alterar('usoEpi', v)}
          />
          <Selecao
            id="treinamentoNr"
            rotulo="Treinamento NR"
            valor={dados.treinamentoNr}
            opcoes={[...TREINAMENTO_NR]}
            aoMudar={(v) => alterar('treinamentoNr', v)}
          />
          <Selecao
            id="trabalhoAltura"
            rotulo="Trabalho em altura"
            valor={dados.trabalhoAltura}
            opcoes={[...TRABALHO_ALTURA]}
            aoMudar={(v) => alterar('trabalhoAltura', v)}
          />
        </div>

        {alertas.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {alertas.map((alerta) => (
              <li
                key={alerta.texto}
                className={`rounded-md border-l-4 px-3 py-2 text-sm ${
                  alerta.nivel === 'grave'
                    ? 'border-red-600 bg-red-50 font-semibold text-red-800'
                    : 'border-amarelo bg-amarelo/10 text-texto'
                }`}
              >
                {alerta.texto}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="cartao p-5">
        <h2 className="mb-1 text-base uppercase tracking-wide">Controle interno</h2>
        <p className="mb-4 text-xs text-cinza">
          A consulta de antecedentes é registro interno do escritório. Nunca perguntar ou
          comentar com o candidato.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Selecao
            id="antecedentes"
            rotulo="Consulta de antecedentes"
            valor={dados.antecedentes}
            opcoes={[...ANTECEDENTES]}
            aoMudar={(v) => alterar('antecedentes', v)}
            obrigatorio
            semVazio
          />
          <div>
            <label htmlFor="status" className="rotulo">
              Status
            </label>
            <select
              id="status"
              className="campo"
              value={dados.status}
              disabled={antecedentesReprovados}
              onChange={(e) => {
                setStatusTocado(true);
                alterar('status', e.target.value);
              }}
            >
              {STATUS.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-cinza">
              {antecedentesReprovados
                ? 'Travado em Reprovado pela regra fixa.'
                : `Sugerido pela pontuação: ${recomendacao.statusSugerido}.`}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="observacoes" className="rotulo">
            Observações
          </label>
          <textarea
            id="observacoes"
            className="campo min-h-[120px]"
            value={dados.observacoes}
            onChange={(e) => alterar('observacoes', e.target.value)}
            placeholder="O que chamou atenção na conversa, disponibilidade de horário, EPI, NR, altura, airless"
          />
        </div>
      </section>

      <section
        className={`cartao border-l-4 p-5 ${
          antecedentesReprovados ? 'border-l-red-600 bg-red-50' : 'border-l-amarelo'
        }`}
      >
        {antecedentesReprovados ? (
          <p className="mb-4 text-sm font-semibold text-red-800">
            Consulta de antecedentes reprovada. Por regra fixa, este candidato fica com status
            Reprovado, independente da pontuação {pontuacao}.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-md font-titulo text-2xl font-bold ${CORES_TOM[recomendacao.tom]}`}
          >
            {pontuacao}
          </div>
          <div className="flex-1">
            <p className="font-titulo text-lg font-semibold text-azul">{recomendacao.texto}</p>
            <p className="text-sm text-cinza">
              Faixa {recomendacao.faixa} · status sugerido {recomendacao.statusSugerido}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className="botao-destaque" disabled={enviando}>
            {enviando ? 'Salvando...' : edicao ? 'Salvar alterações' : 'Salvar triagem'}
          </button>
          <button
            type="button"
            className="botao-secundario"
            onClick={() => router.push('/')}
            disabled={enviando}
          >
            Cancelar
          </button>
        </div>
      </section>
    </form>
  );
}

function Texto({
  id,
  rotulo,
  valor,
  aoMudar,
  obrigatorio,
  placeholder,
}: {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  obrigatorio?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {rotulo}
        {obrigatorio ? <span className="ml-1 text-amarelo">*</span> : null}
      </label>
      <input
        id={id}
        className="campo"
        value={valor}
        placeholder={placeholder}
        required={obrigatorio}
        onChange={(e) => aoMudar(e.target.value)}
      />
    </div>
  );
}

function Selecao({
  id,
  rotulo,
  valor,
  opcoes,
  aoMudar,
  obrigatorio,
  semVazio,
}: {
  id: string;
  rotulo: string;
  valor: string;
  opcoes: string[];
  aoMudar: (valor: string) => void;
  obrigatorio?: boolean;
  semVazio?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="rotulo">
        {rotulo}
        {obrigatorio ? <span className="ml-1 text-amarelo">*</span> : null}
      </label>
      <select
        id={id}
        className="campo"
        value={valor}
        required={obrigatorio}
        onChange={(e) => aoMudar(e.target.value)}
      >
        {semVazio ? null : <option value="">Selecione</option>}
        {opcoes.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
    </div>
  );
}
