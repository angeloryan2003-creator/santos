/**
 * Recalcula a pontuação de todos os candidatos com a régua atual.
 * Use depois de mudar pesos ou opções em src/lib/pontuacao.ts.
 * Não mexe em status: mudar status continua sendo decisão da equipe.
 */
import { PrismaClient } from '@prisma/client';
import { calcularPontuacao } from '../src/lib/pontuacao';

const prisma = new PrismaClient();

async function main() {
  const candidatos = await prisma.candidato.findMany({
    orderBy: { criadoEm: 'asc' },
  });

  const mudancas: string[] = [];
  const semAltura: string[] = [];

  for (const candidato of candidatos) {
    if (!candidato.trabalhoAltura) semAltura.push(candidato.nome);

    const nova = calcularPontuacao({
      experiencia: candidato.experiencia,
      consistencia: candidato.consistencia,
      mobilidade: candidato.mobilidade,
      trabalhoAltura: candidato.trabalhoAltura ?? '',
      documentacao: candidato.documentacao,
      referencias: candidato.referencias,
      disponibilidade: candidato.disponibilidade,
      pretensao: candidato.pretensao,
    });

    if (nova === candidato.pontuacao) continue;

    await prisma.candidato.update({
      where: { id: candidato.id },
      data: { pontuacao: nova },
    });

    mudancas.push(`${candidato.nome}: ${candidato.pontuacao} para ${nova}`);
  }

  console.log(`${candidatos.length} candidatos conferidos, ${mudancas.length} recalculados.`);
  for (const linha of mudancas) console.log(`  ${linha}`);

  if (semAltura.length > 0) {
    console.log(
      `\nAtenção: ${semAltura.length} candidato(s) sem a resposta de trabalho em altura, ` +
        'que agora vale 10 pontos. Eles ficaram com zero nesse critério até alguém editar a triagem:',
    );
    for (const nome of semAltura) console.log(`  ${nome}`);
  }
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
