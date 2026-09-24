import { Suspense } from 'react';
import FormularioLogin from './FormularioLogin';

export const metadata = { title: 'Entrar | Angelo Pinturas' };

export default function PaginaLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-azul px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-titulo text-2xl font-bold uppercase tracking-wide text-white">
            Angelo Pinturas
          </h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-amarelo">
            Triagem de candidatos
          </p>
        </div>

        <div className="cartao p-6">
          <Suspense fallback={null}>
            <FormularioLogin />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          Uso interno da equipe do escritório.
        </p>
      </div>
    </main>
  );
}
