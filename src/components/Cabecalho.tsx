import Link from 'next/link';
import BotaoSair from './BotaoSair';

const NAVEGACAO = [
  { href: '/', rotulo: 'Pipeline' },
  { href: '/nova', rotulo: 'Nova triagem' },
  { href: '/whatsapp', rotulo: 'WhatsApp' },
];

export default function Cabecalho({ atual }: { atual: string }) {
  return (
    <header className="border-b-4 border-amarelo bg-azul">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-titulo text-lg font-bold uppercase tracking-wide text-white">
            Angelo Pinturas
          </span>
          <span className="font-corpo text-xs uppercase tracking-widest text-amarelo">
            Triagem
          </span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1">
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

        <BotaoSair />
      </div>
    </header>
  );
}
