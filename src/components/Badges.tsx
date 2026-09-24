import { faixaPorPontuacao } from '@/lib/pontuacao';

const CORES_STATUS: Record<string, string> = {
  Novo: 'bg-cinza/15 text-texto border-cinza/40',
  'Entrevista marcada': 'bg-azul/10 text-azul border-azul/30',
  'Teste prático': 'bg-amarelo/25 text-azul border-amarelo',
  Aprovado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Banco de reserva': 'bg-slate-100 text-slate-700 border-slate-300',
  Reprovado: 'bg-red-100 text-red-800 border-red-300',
};

export function BadgeStatus({ status }: { status: string }) {
  const cor = CORES_STATUS[status] ?? 'bg-cinza/15 text-texto border-cinza/40';
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cor}`}>
      {status}
    </span>
  );
}

const CORES_FAIXA: Record<string, string> = {
  verde: 'bg-emerald-600 text-white',
  azul: 'bg-azul text-white',
  amarelo: 'bg-amarelo text-azul',
  cinza: 'bg-cinza text-white',
  vermelho: 'bg-red-600 text-white',
};

export function BadgePontuacao({ pontuacao }: { pontuacao: number }) {
  const faixa = faixaPorPontuacao(pontuacao);
  return (
    <span
      title={faixa.texto}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-titulo text-base font-bold ${CORES_FAIXA[faixa.tom]}`}
    >
      {pontuacao}
    </span>
  );
}

export function AvisoAntecedentes({ antecedentes }: { antecedentes: string }) {
  if (antecedentes !== 'Reprovada') return null;
  return (
    <div className="rounded-md border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
      Consulta de antecedentes reprovada. Por regra fixa da triagem, o candidato fica com status
      Reprovado, independente da pontuação.
    </div>
  );
}
