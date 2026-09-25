import Link from 'next/link';
import BotaoSair from './BotaoSair';
import SeletorOperador from './SeletorOperador';

const NAVEGACAO = [
  { href: '/', rotulo: 'Pipeline' },
  { href: '/nova', rotulo: 'Nova triagem' },
  { href: '/whatsapp', rotulo: 'WhatsApp' },
];

export default function Cabecalho({ atual }: { atual: string }) {
  return (
    <header className="border-b-4 border-amarelo bg-azul">
      {/* No celular quebra em duas linhas: marca e ações em cima, navegação embaixo. */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:py-4">
        <Link href="/" className="order-1 mr-auto flex items-baseline gap-2">
          <span className="font-titulo text-lg font-bold uppercase tracking-wide text-white">
            Angelo Pinturas
          </span>
          <span className="font-corpo text-xs uppercase tracking-widest text-amarelo">
            Triagem
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 md:order-2 md:w-auto md:flex-1 md:px-4">
          {NAVEGACAO.map((item) => {
            const ativo = item.href === '/' ? atual === '/' : atual.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  ativo ? 'bg-amarelo text-azul' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                {item.rotulo}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-3 md:gap-3">
          <SeletorOperador />
          <BotaoSair />
        </div>
      </div>
    </header>
  );
}
