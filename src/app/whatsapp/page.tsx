import Cabecalho from '@/components/Cabecalho';
import ListaMensagens from '@/components/ListaMensagens';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'WhatsApp | Angelo Pinturas' };
export const dynamic = 'force-dynamic';

export default async function PaginaWhatsapp() {
  const mensagens = await prisma.mensagemWhatsapp.findMany({
    orderBy: [{ processada: 'asc' }, { recebidaEm: 'desc' }],
    take: 200,
  });

  const idsCandidatos = mensagens
    .map((m) => m.candidatoId)
    .filter((id): id is string => Boolean(id));

  const candidatos = idsCandidatos.length
    ? await prisma.candidato.findMany({
        where: { id: { in: idsCandidatos } },
        select: { id: true, nome: true },
      })
    : [];

  const nomes = Object.fromEntries(candidatos.map((c) => [c.id, c.nome]));
  const pendentes = mensagens.filter((m) => !m.processada).length;

  return (
    <>
      <Cabecalho atual="/whatsapp" />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl">Caixa de entrada do WhatsApp</h1>
          <p className="mt-1 text-sm text-cinza">
            Mensagens recebidas no número da empresa. Nesta fase o sistema só registra: não
            responde, não pontua e não conversa com o candidato.
          </p>
          <p className="mt-2 text-sm font-semibold text-azul">
            {pendentes === 0
              ? 'Nenhuma mensagem pendente.'
              : `${pendentes} mensagem${pendentes > 1 ? 's' : ''} pendente${pendentes > 1 ? 's' : ''}.`}
          </p>
        </div>

        <ListaMensagens mensagens={mensagens} nomesCandidatos={nomes} />
      </main>
    </>
  );
}
