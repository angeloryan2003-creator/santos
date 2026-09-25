'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AlteracaoStatus, Candidato } from '@prisma/client';
import { BadgePontuacao, BadgeStatus, AvisoAntecedentes } from './Badges';
import {
  CRITERIOS,
  STATUS,
  alertasSeguranca,
  faixaPorPontuacao,
  pontosDoCriterio,
} from '@/lib/pontuacao';
import { formatarData, formatarDataHora, formatarTelefone } from '@/lib/formato';
import { useOperador } from '@/lib/operador';

export default function ListaCandidatos({ candidatos }: { candidatos: Candidato[] }) {
  const [aberto, setAberto] = useState<string | null>(null);

  if (candidatos.length === 0) return null;

  return (
    <ul className="space-y-2">
      {candidatos.map((candidato) => (
        <li key={candidato.id} className="cartao overflow-hidden">
          <button
            type="button"
            onClick={() => setAberto(aberto === candidato.id ? null : candidato.id)}
            className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-cinza/5 sm:items-center sm:gap-4"
            aria-expanded={aberto === candidato.id}
          >
            <BadgePontuacao pontuacao={candidato.pontuacao} />

            <div className="min-w-0 flex-1">
              <p className="font-titulo text-base font-semibold leading-tight text-azul">
                {candidato.nome}
              </p>
              <p className="mt-0.5 text-sm leading-tight text-cinza">
                {candidato.vaga} · {formatarTelefone(candidato.telefone)}
                {candidato.cidade ? ` · ${candidato.cidade}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                <BadgeStatus status={candidato.status} />
                <span className="text-xs text-cinza">{formatarData(candidato.criadoEm)}</span>
              </div>
            </div>

            <div className="hidden text-right text-xs text-cinza sm:block">
              {formatarDataHora(candidato.criadoEm)}
            </div>

            <div className="hidden sm:block">
              <BadgeStatus status={candidato.status} />
            </div>

            <span className="mt-1 text-cinza sm:mt-0" aria-hidden>
              {aberto === candidato.id ? '▲' : '▼'}
            </span>
          </button>

          {aberto === candidato.id ? <Detalhe candidato={candidato} /> : null}
        </li>
      ))}
    </ul>
  );
}

function Detalhe({ candidato }: { candidato: Candidato }) {
  const faixa = faixaPorPontuacao(candidato.pontuacao);
  const bloqueado = candidato.antecedentes === 'Reprovada';
  const alertas = alertasSeguranca(candidato);

  return (
    <div className="space-y-5 border-t border-cinza/25 bg-fundo/60 p-4">
      {bloqueado ? <AvisoAntecedentes antecedentes={candidato.antecedentes} /> : null}

      {alertas.length > 0 ? (
        <ul className="space-y-2">
          {alertas.map((alerta) => (
            <li
              key={alerta.texto}
              className={`rounded-md border-l-4 px-3 py-2 text-sm ${
                alerta.nivel === 'grave'
                  ? 'border-red-600 bg-red-50 font-semibold text-red-800'
                  : 'border-amarelo bg-amarelo/15 text-texto'
              }`}
            >
              {alerta.texto}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Campo rotulo="Telefone" valor={formatarTelefone(candidato.telefone)} />
        <Campo rotulo="Vaga" valor={candidato.vaga} />
        <Campo rotulo="Canal de origem" valor={candidato.canal} />
        <Campo rotulo="Cidade / bairro" valor={candidato.cidade ?? 'Não informado'} />
        <Campo rotulo="Triador" valor={candidato.triador ?? 'Não informado'} />
        <Campo rotulo="Antecedentes" valor={candidato.antecedentes} />
        <Campo rotulo="Ferramentas próprias" valor={candidato.ferramentas} />
        <Campo rotulo="Uso de EPI" valor={candidato.usoEpi ?? 'Não perguntado'} />
        <Campo rotulo="Treinamento NR" valor={candidato.treinamentoNr ?? 'Não perguntado'} />
        <Campo
          rotulo="Empresas anteriores"
          valor={candidato.empresasAnteriores ?? 'Não informado'}
        />
        <Campo rotulo="Criado em" valor={formatarDataHora(candidato.criadoEm)} />
        <Campo rotulo="Atualizado em" valor={formatarDataHora(candidato.atualizadoEm)} />
      </div>

      <div>
        <h3 className="mb-2 text-sm uppercase tracking-wide">Pontuação por critério</h3>
        <div className="overflow-hidden rounded-md border border-cinza/25 bg-white">
          <table className="w-full text-sm">
            <tbody>
              {CRITERIOS.map((criterio) => {
                const valor = String(candidato[criterio.chave] ?? '');
                const pontos = pontosDoCriterio(criterio.chave, valor);
                return (
                  <tr key={criterio.chave} className="border-b border-cinza/15 last:border-0">
                    <td className="px-3 py-2 font-semibold text-azul">{criterio.rotulo}</td>
                    <td className="px-3 py-2 text-texto">{valor}</td>
                    <td className="w-24 px-3 py-2 text-right tabular-nums text-cinza">
                      {pontos} / {criterio.peso}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-azul/5">
                <td className="px-3 py-2 font-titulo font-bold text-azul" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-2 text-right font-titulo font-bold tabular-nums text-azul">
                  {candidato.pontuacao} / 100
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-cinza">
          Faixa {faixa.faixa}: <span className="font-semibold text-texto">{faixa.texto}</span>
        </p>
      </div>

      {candidato.observacoes ? (
        <div>
          <h3 className="mb-2 text-sm uppercase tracking-wide">Observações</h3>
          <p className="whitespace-pre-wrap rounded-md border border-cinza/25 bg-white p-3 text-sm">
            {candidato.observacoes}
          </p>
        </div>
      ) : null}

      <Historico id={candidato.id} />

      <EditorStatus
        id={candidato.id}
        statusAtual={candidato.status}
        nome={candidato.nome}
        bloqueado={bloqueado}
      />
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-cinza">{rotulo}</p>
      <p className="mt-0.5 text-sm text-texto">{valor}</p>
    </div>
  );
}

function Historico({ id }: { id: string }) {
  const [registros, setRegistros] = useState<AlteracaoStatus[] | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/candidatos/${id}`)
      .then((resposta) => (resposta.ok ? resposta.json() : null))
      .then((dados) => {
        if (ativo && dados) setRegistros(dados.historico ?? []);
      })
      .catch(() => {
        if (ativo) setRegistros([]);
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  if (!registros || registros.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm uppercase tracking-wide">Histórico de status</h3>
      <ul className="space-y-1 text-sm text-texto">
        {registros.map((registro) => (
          <li key={registro.id} className="rounded-md border border-cinza/25 bg-white px-3 py-2">
            {registro.de} para <span className="font-semibold">{registro.para}</span>
            <span className="text-cinza">
              {' '}
              · {formatarDataHora(registro.criadoEm)}
              {registro.autor ? ` · ${registro.autor}` : ' · autor não identificado'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditorStatus({
  id,
  statusAtual,
  nome,
  bloqueado,
}: {
  id: string;
  statusAtual: string;
  nome: string;
  bloqueado: boolean;
}) {
  const router = useRouter();
  const [operador] = useOperador();
  const [excluindo, setExcluindo] = useState(false);
  const [status, setStatus] = useState(statusAtual);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function alterar(novo: string) {
    const anterior = status;
    setStatus(novo);
    setSalvando(true);
    setMensagem('');
    setErro('');

    try {
      const resposta = await fetch(`/api/candidatos/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: novo, autor: operador || undefined }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setStatus(anterior);
        setErro(dados.erro ?? 'Não foi possível salvar o status.');
        return;
      }

      setMensagem('Status atualizado.');
      router.refresh();
    } catch {
      setStatus(anterior);
      setErro('Falha de conexão ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border-t border-cinza/25 pt-4">
      <div className="w-56">
        <label htmlFor={`status-${id}`} className="rotulo">
          Status
        </label>
        <select
          id={`status-${id}`}
          className="campo"
          value={status}
          disabled={salvando || bloqueado}
          onChange={(e) => alterar(e.target.value)}
        >
          {STATUS.map((opcao) => (
            <option key={opcao} value={opcao}>
              {opcao}
            </option>
          ))}
        </select>
      </div>

      <Link href={`/candidato/${id}/editar`} className="botao-secundario mb-0.5">
        Editar triagem
      </Link>

      <button
        type="button"
        className="mb-0.5 inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        disabled={excluindo}
        onClick={async () => {
          const confirmado = window.confirm(
            `Excluir definitivamente a triagem de ${nome}? Isso apaga os dados do candidato e não tem volta.`,
          );
          if (!confirmado) return;
          setExcluindo(true);
          setErro('');
          try {
            const resposta = await fetch(`/api/candidatos/${id}`, { method: 'DELETE' });
            if (!resposta.ok) {
              const dados = await resposta.json().catch(() => ({}));
              setErro(dados.erro ?? 'Não foi possível excluir.');
              return;
            }
            router.refresh();
          } catch {
            setErro('Falha de conexão ao excluir.');
          } finally {
            setExcluindo(false);
          }
        }}
      >
        {excluindo ? 'Excluindo...' : 'Excluir'}
      </button>

      {bloqueado ? (
        <p className="pb-2 text-sm text-red-700">
          Status travado pela regra de antecedentes.
        </p>
      ) : null}
      {salvando ? <p className="pb-2 text-sm text-cinza">Salvando...</p> : null}
      {mensagem ? <p className="pb-2 text-sm text-emerald-700">{mensagem}</p> : null}
      {erro ? <p className="pb-2 text-sm text-red-700">{erro}</p> : null}
    </div>
  );
}
