import { ROTEIRO } from '@/lib/roteiro';

export default function PainelRoteiro() {
  return (
    <aside className="cartao max-h-[calc(100vh-3rem)] overflow-y-auto p-5">
      <h2 className="text-base uppercase tracking-wide">Roteiro da ligação</h2>
      <p className="mt-1 text-xs text-cinza">
        Referência para a conversa. Não pergunte nada sobre antecedentes ao candidato.
      </p>

      <div className="mt-4 space-y-4">
        {ROTEIRO.map((bloco) => (
          <section key={bloco.titulo}>
            <h3 className="text-sm font-semibold text-azul">{bloco.titulo}</h3>
            <ul className="mt-1 space-y-1.5 border-l-2 border-amarelo pl-3">
              {bloco.itens.map((item) => (
                <li key={item} className="text-sm leading-snug text-texto">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}
