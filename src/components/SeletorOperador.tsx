'use client';

import { TRIADORES } from '@/lib/pontuacao';
import { useOperador } from '@/lib/operador';

export default function SeletorOperador() {
  const [operador, definir] = useOperador();

  return (
    <label className="flex items-center gap-2 text-xs text-white/70">
      <span className="hidden sm:inline">Quem está usando</span>
      <select
        value={operador}
        onChange={(e) => definir(e.target.value)}
        className="rounded-md border border-white/30 bg-azul px-2 py-1.5 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-amarelo"
        aria-label="Quem está usando o sistema"
      >
        <option value="">Não identificado</option>
        {TRIADORES.map((nome) => (
          <option key={nome} value={nome}>
            {nome}
          </option>
        ))}
      </select>
    </label>
  );
}
