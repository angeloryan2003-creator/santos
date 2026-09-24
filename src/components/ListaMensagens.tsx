'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { MensagemWhatsapp } from '@prisma/client';
import { formatarDataHora, formatarTelefone } from '@/lib/formato';

export default function ListaMensagens({
  mensagens,
  nomesCandidatos,
}: {
  mensagens: MensagemWhatsapp[];
  nomesCandidatos: Record<string, string>;
}) {
  if (mensagens.length === 0) {
    return (
      <div className="cartao p-6 text-sm text-cinza">
        Nenhuma mensagem recebida ainda. Assim que o webhook estiver ligado no Meta, as mensagens
        enviadas para o número da empresa aparecem aqui.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {mensagens.map((mensagem) => (
        <Cartao
          key={mensagem.id}
          mensagem={mensagem}
          nomeCandidato={mensagem.candidatoId ? nomesCandidatos[mensagem.candidatoId] : undefined}
        />
      ))}
    </ul>
  );
}

function Cartao({
  mensagem,
  nomeCandidato,
}: {
  mensagem: MensagemWhatsapp;
  nomeCandidato?: string;
}) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const observacaoInicial = `Mensagem recebida no WhatsApp em ${formatarDataHora(
    mensagem.recebidaEm,
  )}:\n"${mensagem.corpo}"`;

  const linkTriagem = `/nova?telefone=${encodeURIComponent(
    mensagem.telefone,
  )}&obs=${encodeURIComponent(observacaoInicial)}&mensagemId=${encodeURIComponent(mensagem.id)}`;

  async function alternarProcessada() {
    setSalvando(true);
    setErro('');
    try {
      const resposta = await fetch(`/api/whatsapp/mensagens/${mensagem.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ processada: !mensagem.processada }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(dados.erro ?? 'Não foi possível atualizar.');
        return;
      }
      router.refresh();
    } catch {
      setErro('Falha de conexão.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <li
      className={`cartao border-l-4 p-4 ${
        mensagem.processada ? 'border-l-cinza/40 opacity-75' : 'border-l-amarelo'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-titulo text-base font-semibold text-azul">
          {formatarTelefone(mensagem.telefone)}
        </p>
        <p className="text-xs text-cinza">{formatarDataHora(mensagem.recebidaEm)}</p>
      </div>

      <p className="mt-2 whitespace-pre-wrap rounded-md bg-fundo p-3 text-sm text-texto">
        {mensagem.corpo}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {mensagem.processada ? (
          <>
            <span className="rounded-full border border-cinza/40 bg-cinza/10 px-2.5 py-0.5 text-xs font-semibold">
              Processada
            </span>
            {nomeCandidato ? (
              <Link
                href={`/?q=${encodeURIComponent(nomeCandidato)}`}
                className="text-sm font-semibold text-azul underline underline-offset-2"
              >
                Ver triagem de {nomeCandidato}
              </Link>
            ) : null}
            <button
              type="button"
              className="botao-secundario"
              onClick={alternarProcessada}
              disabled={salvando}
            >
              Reabrir
            </button>
          </>
        ) : (
          <>
            <Link href={linkTriagem} className="botao-destaque">
              Transformar em triagem
            </Link>
            <button
              type="button"
              className="botao-secundario"
              onClick={alternarProcessada}
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Marcar como processada'}
            </button>
          </>
        )}
        {erro ? <span className="text-sm text-red-700">{erro}</span> : null}
      </div>
    </li>
  );
}
