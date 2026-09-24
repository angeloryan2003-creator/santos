import { Suspense } from 'react';
import Cabecalho from '@/components/Cabecalho';
import FormularioTriagem from '@/components/FormularioTriagem';
import PainelRoteiro from '@/components/PainelRoteiro';

export const metadata = { title: 'Nova triagem | Angelo Pinturas' };
export const dynamic = 'force-dynamic';

export default function PaginaNovaTriagem() {
  return (
    <>
      <Cabecalho atual="/nova" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl">Nova triagem</h1>
          <p className="mt-1 text-sm text-cinza">
            Preencha durante a ligação. A pontuação é calculada na hora e conferida de novo no
            servidor ao salvar.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <Suspense fallback={<p className="text-sm text-cinza">Carregando formulário...</p>}>
            <FormularioTriagem />
          </Suspense>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <PainelRoteiro />
          </div>
        </div>
      </main>
    </>
  );
}
