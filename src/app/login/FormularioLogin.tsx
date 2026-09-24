'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const destino = parametros.get('de') ?? '/';

  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const resposta = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ senha }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(dados.erro ?? 'Não foi possível entrar.');
        setEnviando(false);
        return;
      }

      router.replace(destino.startsWith('/') ? destino : '/');
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="senha" className="rotulo">
          Senha de acesso
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          autoFocus
          className="campo"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </div>

      {erro ? (
        <p className="rounded-md border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-800">
          {erro}
        </p>
      ) : null}

      <button type="submit" className="botao-destaque w-full" disabled={enviando || !senha}>
        {enviando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
