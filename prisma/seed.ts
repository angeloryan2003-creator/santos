/**
 * Dados de demonstração para a equipe ver o app cheio antes de usar de verdade.
 * Apaga tudo e recria. Nunca rode isso apontando para o banco de produção
 * depois que a equipe começar a usar.
 */
import { PrismaClient } from '@prisma/client';
import { calcularPontuacao, recomendar } from '../src/lib/pontuacao';

const prisma = new PrismaClient();

type Entrada = {
  nome: string;
  telefone: string;
  vaga: string;
  canal: string;
  cidade: string;
  experiencia: string;
  consistencia: string;
  mobilidade: string;
  ferramentas: string;
  documentacao: string;
  referencias: string;
  disponibilidade: string;
  pretensao: string;
  antecedentes: string;
  usoEpi?: string;
  treinamentoNr?: string;
  trabalhoAltura?: string;
  empresasAnteriores?: string;
  triador: string;
  observacoes?: string;
  status?: string;
  diasAtras: number;
};

const ENTRADAS: Entrada[] = [
  {
    nome: 'Marcos Antônio da Silva',
    telefone: '11987654321',
    vaga: 'Pintor',
    canal: 'Indicação de funcionário',
    cidade: 'Barueri, Jardim Silveira',
    experiencia: 'Mais de 3 anos',
    consistencia: 'Mais de 2 anos',
    mobilidade: 'Perto, até 30 min',
    ferramentas: 'Completas',
    documentacao: 'Completa',
    referencias: 'Tem e dá pra verificar',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'OK',
    usoEpi: 'Sim, usa sempre',
    treinamentoNr: 'NR-35 em dia',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Construtora Vieira, 4 anos. Pintou fachada e área comum.',
    triador: 'Nayara',
    observacoes: 'Indicado pelo Everton. Já trabalhou com airless. Fala bem, pontual na ligação.',
    diasAtras: 1,
  },
  {
    nome: 'José Ricardo Nogueira',
    telefone: '11976543210',
    vaga: 'Pintor',
    canal: 'WhatsApp direto',
    cidade: 'Santana de Parnaíba',
    experiencia: 'Mais de 3 anos',
    consistencia: '6 meses a 2 anos',
    mobilidade: 'Média, até 1h',
    ferramentas: 'Completas',
    documentacao: 'Completa',
    referencias: 'Tem e dá pra verificar',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'Solicitada',
    usoEpi: 'Sim, usa sempre',
    treinamentoNr: 'Já fez, está vencido',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Autônomo por 6 anos, obras residenciais em Alphaville.',
    triador: 'Angelo',
    observacoes: 'Aceita registro em carteira. Pediu para começar depois do dia 10.',
    diasAtras: 2,
  },
  {
    nome: 'Edvaldo Pereira Lima',
    telefone: '11965432109',
    vaga: 'Pintor',
    canal: 'Grupo de emprego',
    cidade: 'Carapicuíba',
    experiencia: '1 a 3 anos',
    consistencia: 'Mais de 2 anos',
    mobilidade: 'Média, até 1h',
    ferramentas: 'Parcial',
    documentacao: 'Completa',
    referencias: 'Tem e dá pra verificar',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'OK',
    usoEpi: 'Já usou algumas vezes',
    treinamentoNr: 'Nunca fez',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Pinturas Delta, 2 anos e meio.',
    triador: 'Sara',
    observacoes: 'Precisa de NR-35 antes de subir em andaime.',
    diasAtras: 3,
  },
  {
    nome: 'Wellington Souza Barbosa',
    telefone: '11954321098',
    vaga: 'Ajudante',
    canal: 'Indeed',
    cidade: 'Osasco, Km 18',
    experiencia: 'Menos de 1 ano',
    consistencia: '6 meses a 2 anos',
    mobilidade: 'Média, até 1h',
    ferramentas: 'Nenhuma',
    documentacao: 'Completa',
    referencias: 'Tem mas não verificada',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'Pendente',
    usoEpi: 'Já usou algumas vezes',
    treinamentoNr: 'Nunca fez',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Ajudante geral em construtora por 1 ano.',
    triador: 'Nayara',
    observacoes: 'Quer aprender pintura. Disposto a começar como ajudante.',
    diasAtras: 3,
  },
  {
    nome: 'Cleiton Rodrigues dos Santos',
    telefone: '11943210987',
    vaga: 'Pintor',
    canal: 'Gupy',
    cidade: 'Itapevi',
    experiencia: '1 a 3 anos',
    consistencia: 'Menos de 6 meses',
    mobilidade: 'Longe ou depende de carona',
    ferramentas: 'Parcial',
    documentacao: 'Parcial',
    referencias: 'Tem mas não verificada',
    disponibilidade: '1 a 2 semanas',
    pretensao: 'Acima',
    antecedentes: 'Pendente',
    usoEpi: 'Já usou algumas vezes',
    treinamentoNr: 'Não sabe informar',
    trabalhoAltura: 'Com restrição',
    empresasAnteriores: 'Três empresas em dois anos, nenhuma passou de cinco meses.',
    triador: 'Sara',
    observacoes: 'Histórico picado e mora longe. Pretensão acima da faixa.',
    diasAtras: 4,
  },
  {
    nome: 'Antônio Carlos Ferreira',
    telefone: '11932109876',
    vaga: 'Pintor',
    canal: 'WhatsApp direto',
    cidade: 'Barueri, Vila Boa Vista',
    experiencia: 'Mais de 3 anos',
    consistencia: 'Mais de 2 anos',
    mobilidade: 'Perto, até 30 min',
    ferramentas: 'Completas',
    documentacao: 'Completa',
    referencias: 'Tem e dá pra verificar',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'Reprovada',
    usoEpi: 'Sim, usa sempre',
    treinamentoNr: 'NR-35 em dia',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Experiência longa em pintura industrial.',
    triador: 'Angelo',
    observacoes: 'Perfil técnico forte, barrado pela regra interna de antecedentes.',
    diasAtras: 5,
  },
  {
    nome: 'Douglas Henrique Martins',
    telefone: '11921098765',
    vaga: 'Ajudante',
    canal: 'Grupo de emprego',
    cidade: 'Jandira',
    experiencia: 'Nenhuma',
    consistencia: 'Primeiro emprego / não se aplica',
    mobilidade: 'Média, até 1h',
    ferramentas: 'Nenhuma',
    documentacao: 'Parcial',
    referencias: 'Não tem',
    disponibilidade: 'Imediata',
    pretensao: 'Não informou',
    antecedentes: 'Pendente',
    usoEpi: 'Nunca usou',
    treinamentoNr: 'Nunca fez',
    trabalhoAltura: 'Não trabalha em altura',
    triador: 'Nayara',
    observacoes: 'Primeiro emprego, 19 anos. Falta CTPS e comprovante.',
    diasAtras: 6,
  },
  {
    nome: 'Rafael Gomes de Oliveira',
    telefone: '11910987654',
    vaga: 'Pintor',
    canal: 'Catho',
    cidade: 'Alphaville, Barueri',
    experiencia: '1 a 3 anos',
    consistencia: '6 meses a 2 anos',
    mobilidade: 'Perto, até 30 min',
    ferramentas: 'Parcial',
    documentacao: 'Completa',
    referencias: 'Tem e dá pra verificar',
    disponibilidade: '1 a 2 semanas',
    pretensao: 'Dentro da faixa',
    antecedentes: 'Solicitada',
    usoEpi: 'Sim, usa sempre',
    treinamentoNr: 'NR-35 em dia',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Pintura predial, 2 anos na mesma empresa.',
    triador: 'Angelo',
    observacoes: 'Mora perto. Precisa avisar a empresa atual com duas semanas.',
    diasAtras: 7,
  },
  {
    nome: 'Sérgio Luiz Aparecido',
    telefone: '11909876543',
    vaga: 'Pintor',
    canal: 'Indicação de funcionário',
    cidade: 'Barueri, Engenho Novo',
    experiencia: 'Mais de 3 anos',
    consistencia: 'Mais de 2 anos',
    mobilidade: 'Perto, até 30 min',
    ferramentas: 'Completas',
    documentacao: 'Parcial',
    referencias: 'Tem mas não verificada',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'OK',
    usoEpi: 'Sim, usa sempre',
    treinamentoNr: 'Já fez, está vencido',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Dez anos de pintura, últimos três como autônomo.',
    triador: 'Sara',
    observacoes: 'Falta comprovante de residência. Traz na entrevista.',
    status: 'Aprovado',
    diasAtras: 9,
  },
  {
    nome: 'Vanderlei Moraes',
    telefone: '11898765432',
    vaga: 'Ajudante',
    canal: 'Outro',
    cidade: 'Cotia',
    experiencia: 'Menos de 1 ano',
    consistencia: 'Menos de 6 meses',
    mobilidade: 'Longe ou depende de carona',
    ferramentas: 'Nenhuma',
    documentacao: 'Nenhuma',
    referencias: 'Não tem',
    disponibilidade: 'Mais de 1 mês',
    pretensao: 'Não informou',
    antecedentes: 'Pendente',
    usoEpi: 'Nunca usou',
    treinamentoNr: 'Nunca fez',
    trabalhoAltura: 'Não trabalha em altura',
    triador: 'Nayara',
    observacoes: 'Depende de carona e só pode começar no mês que vem.',
    diasAtras: 11,
  },
  {
    nome: 'Fábio Nascimento Cruz',
    telefone: '11887654321',
    vaga: 'Pintor',
    canal: 'WhatsApp direto',
    cidade: 'Barueri, Centro',
    experiencia: '1 a 3 anos',
    consistencia: 'Mais de 2 anos',
    mobilidade: 'Perto, até 30 min',
    ferramentas: 'Completas',
    documentacao: 'Completa',
    referencias: 'Tem mas não verificada',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'OK',
    usoEpi: 'Sim, usa sempre',
    treinamentoNr: 'NR-35 em dia',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Pintou condomínio em Alphaville por dois anos e meio.',
    triador: 'Angelo',
    observacoes: 'Referência do síndico do condomínio, ainda não ligamos.',
    diasAtras: 13,
  },
  {
    nome: 'Paulo César Mendes',
    telefone: '11876543210',
    vaga: 'Ajudante',
    canal: 'Grupo de emprego',
    cidade: 'Barueri, Parque Imperial',
    experiencia: 'Menos de 1 ano',
    consistencia: '6 meses a 2 anos',
    mobilidade: 'Perto, até 30 min',
    ferramentas: 'Parcial',
    documentacao: 'Completa',
    referencias: 'Tem e dá pra verificar',
    disponibilidade: 'Imediata',
    pretensao: 'Dentro da faixa',
    antecedentes: 'OK',
    usoEpi: 'Já usou algumas vezes',
    treinamentoNr: 'Nunca fez',
    trabalhoAltura: 'Sem restrição',
    empresasAnteriores: 'Ajudante de pedreiro por um ano e meio.',
    triador: 'Sara',
    observacoes: 'Mora a quinze minutos da sede. Perfil bom para ajudante.',
    diasAtras: 15,
  },
];

const MENSAGENS = [
  {
    telefone: '5511995551122',
    corpo: 'Boa tarde, vi a vaga de pintor no grupo. Tenho 6 anos de experiência com fachada.',
    minutosAtras: 25,
    processada: false,
  },
  {
    telefone: '5511994448877',
    corpo: 'Oi, é sobre a vaga de ajudante? Nunca trabalhei com pintura mas quero aprender.',
    minutosAtras: 90,
    processada: false,
  },
  {
    telefone: '5511993337766',
    corpo: '[áudio]',
    minutosAtras: 200,
    processada: false,
  },
  {
    telefone: '5511992226655',
    corpo: 'Bom dia, mandei currículo pelo Indeed. Meu nome é Wellington, vaga de ajudante.',
    minutosAtras: 1500,
    processada: true,
  },
];

function dataAtras(dias: number): Date {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

async function main() {
  await prisma.alteracaoStatus.deleteMany();
  await prisma.mensagemWhatsapp.deleteMany();
  await prisma.candidato.deleteMany();

  for (const entrada of ENTRADAS) {
    const { diasAtras, status, ...resto } = entrada;
    const pontuacao = calcularPontuacao(resto);
    const recomendacao = recomendar(pontuacao, resto.antecedentes);
    const statusFinal =
      resto.antecedentes === 'Reprovada' ? 'Reprovado' : (status ?? recomendacao.statusSugerido);

    const criadoEm = dataAtras(diasAtras);

    const candidato = await prisma.candidato.create({
      data: {
        ...resto,
        pontuacao,
        status: statusFinal,
        criadoEm,
        atualizadoEm: criadoEm,
      },
    });

    if (status && status !== recomendacao.statusSugerido) {
      await prisma.alteracaoStatus.create({
        data: {
          candidatoId: candidato.id,
          de: recomendacao.statusSugerido,
          para: status,
          autor: resto.triador,
          criadoEm: dataAtras(Math.max(diasAtras - 2, 0)),
        },
      });
    }
  }

  const wellington = await prisma.candidato.findFirst({
    where: { nome: { startsWith: 'Wellington' } },
  });

  for (const mensagem of MENSAGENS) {
    const { minutosAtras, ...resto } = mensagem;
    await prisma.mensagemWhatsapp.create({
      data: {
        ...resto,
        recebidaEm: new Date(Date.now() - minutosAtras * 60 * 1000),
        candidatoId: resto.processada ? (wellington?.id ?? null) : null,
      },
    });
  }

  const total = await prisma.candidato.count();
  console.log(`Seed concluído: ${total} candidatos e ${MENSAGENS.length} mensagens.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
