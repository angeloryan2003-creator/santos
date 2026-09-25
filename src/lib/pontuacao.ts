/**
 * Régua de triagem da Angelo Pinturas.
 * Score de 0 a 100, soma de 8 critérios de opção única.
 * Esta é a fonte única da verdade: o formulário monta os selects a partir
 * daqui e a API recalcula o score no servidor com as mesmas tabelas.
 */

export type ChaveCriterio =
  | 'experiencia'
  | 'consistencia'
  | 'mobilidade'
  | 'trabalhoAltura'
  | 'documentacao'
  | 'referencias'
  | 'disponibilidade'
  | 'pretensao';

export type Opcao = { valor: string; pontos: number };

export type Criterio = {
  chave: ChaveCriterio;
  rotulo: string;
  peso: number;
  ajuda?: string;
  opcoes: Opcao[];
};

export const CRITERIOS: Criterio[] = [
  {
    chave: 'experiencia',
    rotulo: 'Experiência na função',
    peso: 25,
    ajuda: 'Tempo de trabalho efetivo com pintura.',
    opcoes: [
      { valor: 'Nenhuma', pontos: 0 },
      { valor: 'Menos de 1 ano', pontos: 8 },
      { valor: '1 a 3 anos', pontos: 16 },
      { valor: 'Mais de 3 anos', pontos: 25 },
    ],
  },
  {
    chave: 'consistencia',
    rotulo: 'Consistência no histórico',
    peso: 15,
    ajuda: 'Tempo médio nos empregos anteriores.',
    opcoes: [
      { valor: 'Primeiro emprego / não se aplica', pontos: 8 },
      { valor: 'Menos de 6 meses', pontos: 5 },
      { valor: '6 meses a 2 anos', pontos: 10 },
      { valor: 'Mais de 2 anos', pontos: 15 },
    ],
  },
  {
    chave: 'mobilidade',
    rotulo: 'Mobilidade / distância até a obra',
    peso: 15,
    opcoes: [
      { valor: 'Perto, até 30 min', pontos: 15 },
      { valor: 'Média, até 1h', pontos: 10 },
      { valor: 'Longe ou depende de carona', pontos: 3 },
    ],
  },
  {
    chave: 'trabalhoAltura',
    rotulo: 'Trabalho em altura',
    peso: 10,
    ajuda: 'Fachada e andaime são a maior parte do serviço, por isso pontua.',
    opcoes: [
      { valor: 'Sem restrição', pontos: 10 },
      { valor: 'Com restrição', pontos: 4 },
      { valor: 'Não trabalha em altura', pontos: 0 },
    ],
  },
  {
    chave: 'documentacao',
    rotulo: 'Documentação',
    peso: 15,
    ajuda: 'RG, CPF, CTPS e comprovante de residência.',
    opcoes: [
      { valor: 'Completa', pontos: 15 },
      { valor: 'Parcial', pontos: 7 },
      { valor: 'Nenhuma', pontos: 0 },
    ],
  },
  {
    chave: 'referencias',
    rotulo: 'Referências verificáveis',
    peso: 10,
    opcoes: [
      { valor: 'Tem e dá pra verificar', pontos: 10 },
      { valor: 'Tem mas não verificada', pontos: 5 },
      { valor: 'Não tem', pontos: 0 },
    ],
  },
  {
    chave: 'disponibilidade',
    rotulo: 'Disponibilidade pra começar',
    peso: 5,
    opcoes: [
      { valor: 'Imediata', pontos: 5 },
      { valor: '1 a 2 semanas', pontos: 3 },
      { valor: 'Mais de 1 mês', pontos: 0 },
    ],
  },
  {
    chave: 'pretensao',
    rotulo: 'Pretensão salarial',
    peso: 5,
    ajuda: 'Compatibilidade com a faixa praticada para a vaga.',
    opcoes: [
      { valor: 'Dentro da faixa', pontos: 5 },
      { valor: 'Acima', pontos: 0 },
      { valor: 'Não informou', pontos: 2 },
    ],
  },
];

export const PONTUACAO_MAXIMA = CRITERIOS.reduce((soma, c) => soma + c.peso, 0);

export type RespostasCriterios = Record<ChaveCriterio, string>;

export function pontosDoCriterio(chave: ChaveCriterio, valor: string): number {
  const criterio = CRITERIOS.find((c) => c.chave === chave);
  if (!criterio) return 0;
  return criterio.opcoes.find((o) => o.valor === valor)?.pontos ?? 0;
}

export function calcularPontuacao(respostas: Partial<RespostasCriterios>): number {
  return CRITERIOS.reduce(
    (total, criterio) => total + pontosDoCriterio(criterio.chave, respostas[criterio.chave] ?? ''),
    0,
  );
}

export const STATUS = [
  'Novo',
  'Entrevista marcada',
  'Teste prático',
  'Aprovado',
  'Banco de reserva',
  'Reprovado',
] as const;

export type Status = (typeof STATUS)[number];

export const ANTECEDENTES = ['Pendente', 'Solicitada', 'OK', 'Reprovada'] as const;
export type Antecedentes = (typeof ANTECEDENTES)[number];

export const VAGAS = ['Pintor', 'Ajudante'] as const;

export const CANAIS = [
  'WhatsApp direto',
  'Gupy',
  'Catho',
  'Indeed',
  'Grupo de emprego',
  'Indicação de funcionário',
  'Outro',
] as const;

export const TRIADORES = ['Angelo', 'Nayara', 'Sara'] as const;

export type Recomendacao = {
  faixa: string;
  texto: string;
  statusSugerido: Status;
  /** Classe de cor usada nos avisos e badges. */
  tom: 'verde' | 'azul' | 'amarelo' | 'cinza' | 'vermelho';
};

/**
 * Faixa de resultado pela pontuação, ignorando antecedentes.
 */
export function faixaPorPontuacao(pontuacao: number): Recomendacao {
  if (pontuacao >= 80) {
    return {
      faixa: '80 a 100',
      texto: 'Avançar para teste prático',
      statusSugerido: 'Teste prático',
      tom: 'verde',
    };
  }
  if (pontuacao >= 60) {
    return {
      faixa: '60 a 79',
      texto: 'Agendar entrevista',
      statusSugerido: 'Entrevista marcada',
      tom: 'azul',
    };
  }
  if (pontuacao >= 40) {
    return {
      faixa: '40 a 59',
      texto: 'Banco de reserva',
      statusSugerido: 'Banco de reserva',
      tom: 'amarelo',
    };
  }
  return {
    faixa: 'abaixo de 40',
    texto: 'Não avançar agora',
    statusSugerido: 'Novo',
    tom: 'cinza',
  };
}

/**
 * Regra fixa: antecedentes reprovados derrubam o candidato,
 * qualquer que seja a pontuação.
 */
export function recomendar(pontuacao: number, antecedentes: string): Recomendacao {
  if (antecedentes === 'Reprovada') {
    return {
      faixa: 'regra fixa',
      texto: 'Consulta de antecedentes reprovada, candidato não avança',
      statusSugerido: 'Reprovado',
      tom: 'vermelho',
    };
  }
  return faixaPorPontuacao(pontuacao);
}

/**
 * Segurança do trabalho. Registro obrigatório, mas fora da régua de pontuação:
 * a régua é a mesma que a equipe já usa e não foi alterada. Aqui o app só
 * guarda a resposta e levanta alerta na tela, porque pintura de fachada é
 * trabalho em altura e isso não pode passar batido numa triagem.
 */
export const USO_EPI = ['Sim, usa sempre', 'Já usou algumas vezes', 'Nunca usou'] as const;

export const TREINAMENTO_NR = [
  'NR-35 em dia',
  'Já fez, está vencido',
  'Nunca fez',
  'Não sabe informar',
] as const;

/** Ferramentas deixou de pontuar: a empresa fornece o material. Fica como registro. */
export const FERRAMENTAS = ['Completas', 'Parcial', 'Nenhuma'] as const;

/** Opções do critério de altura, para quem precisa da lista pronta. */
export const TRABALHO_ALTURA =
  CRITERIOS.find((c) => c.chave === 'trabalhoAltura')!.opcoes.map((o) => o.valor);

export type Alerta = { nivel: 'grave' | 'atencao'; texto: string };

export function alertasSeguranca(dados: {
  vaga?: string | null;
  usoEpi?: string | null;
  treinamentoNr?: string | null;
  trabalhoAltura?: string | null;
}): Alerta[] {
  const alertas: Alerta[] = [];

  if (dados.trabalhoAltura === 'Não trabalha em altura') {
    alertas.push({
      nivel: dados.vaga === 'Pintor' ? 'grave' : 'atencao',
      texto:
        dados.vaga === 'Pintor'
          ? 'Não trabalha em altura. Não pode ser escalado em fachada nem em andaime, o que corta boa parte do serviço de pintor.'
          : 'Não trabalha em altura. Limita a escala em obra com andaime.',
    });
  }

  if (dados.trabalhoAltura === 'Com restrição') {
    alertas.push({
      nivel: 'atencao',
      texto: 'Trabalha em altura com restrição. Confirme qual é a restrição antes de escalar.',
    });
  }

  if (dados.treinamentoNr === 'Nunca fez' || dados.treinamentoNr === 'Não sabe informar') {
    alertas.push({
      nivel: 'atencao',
      texto: 'Sem NR-35 confirmada. Precisa de treinamento antes de qualquer serviço em altura.',
    });
  }

  if (dados.treinamentoNr === 'Já fez, está vencido') {
    alertas.push({ nivel: 'atencao', texto: 'NR-35 vencida. Precisa de reciclagem.' });
  }

  if (dados.usoEpi === 'Nunca usou') {
    alertas.push({
      nivel: 'atencao',
      texto: 'Nunca usou EPI. Prever integração de segurança antes de entrar em obra.',
    });
  }

  return alertas;
}
