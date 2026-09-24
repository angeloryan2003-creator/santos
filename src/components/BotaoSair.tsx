'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BotaoSair() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className="rounded-md border border-white/30 px-3 py-1.5 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:opacity-60"
    >
      {saindo ? 'Saindo...' : 'Sair'}
    </button>
  );
}
