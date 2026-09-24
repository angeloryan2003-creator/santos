/** Roteiro de perguntas usado na ligação de triagem. */
export type BlocoRoteiro = { titulo: string; itens: string[] };

export const ROTEIRO: BlocoRoteiro[] = [
  {
    titulo: 'Abertura',
    itens: [
      'Oi, tudo bem? Aqui é da Angelo Pinturas. Vi seu interesse na vaga de [pintor/ajudante], posso te fazer umas perguntas rápidas?',
    ],
  },
  {
    titulo: 'Experiência',
    itens: [
      'Já trabalhou com pintura antes, onde e em que tipo de ambiente?',
      'Quanto tempo ficou no último emprego, por que saiu?',
      'Já pintou fachada, área interna, estrutura metálica?',
    ],
  },
  {
    titulo: 'Logística',
    itens: [
      'Onde mora, como chegaria até a obra ou até Alphaville?',
      'Tem carteira de motorista ou depende de transporte público?',
    ],
  },
  {
    titulo: 'Ferramentas',
    itens: [
      'Tem ferramenta própria (pincel, rolo, desempenadeira, estilete)?',
      'Já trabalhou com máquina airless?',
    ],
  },
  {
    titulo: 'Segurança',
    itens: [
      'Já usou EPI?',
      'Já fez algum treinamento de NR?',
      'Tem problema em trabalhar em altura?',
    ],
  },
  {
    titulo: 'Documentação',
    itens: [
      'Tem carteira assinada em algum emprego anterior?',
      'Consegue trazer RG, CPF e comprovante se for chamado?',
    ],
  },
  {
    titulo: 'Fechamento',
    itens: [
      'Qual sua pretensão salarial?',
      'Quando poderia começar?',
      'Tem referência de emprego anterior pra gente confirmar?',
    ],
  },
];
