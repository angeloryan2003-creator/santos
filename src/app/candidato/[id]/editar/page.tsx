import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Cabecalho from '@/components/Cabecalho';
import FormularioTriagem from '@/components/FormularioTriagem';
import PainelRoteiro from '@/components/PainelRoteiro';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Editar triagem | Angelo Pinturas' };
export const dynamic = 'force-dynamic';

export default async function PaginaEditarTriagem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidato = await prisma.candidato.findUnique({ where: { id } });
  if (!candidato) notFound();

  return (
    <>
      <Cabecalho atual="/" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm font-semibold text-azul underline underline-offset-2">
            Voltar para o pipeline
          </Link>
          <h1 className="mt-2 text-2xl">Editar triagem de {candidato.nome}</h1>
          <p className="mt-1 text-sm text-cinza">
            A pontuação é recalculada ao salvar. Mudança de status fica registrada no histórico.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <Suspense fallback={<p className="text-sm text-cinza">Carregando formulário...</p>}>
            <FormularioTriagem candidato={candidato} />
          </Suspense>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <PainelRoteiro />
          </div>
        </div>
      </main>
    </>
  );
}
