# Triagem de candidatos | Angelo Pinturas

Ferramenta interna de triagem de pintores e ajudantes de pintura. Uso restrito à equipe do
escritório. Registra a triagem com pontuação automática, mantém o pipeline de candidatos e
recebe as mensagens do WhatsApp Business da empresa numa caixa de entrada.

Nesta fase o WhatsApp é só entrada de dados. O sistema não responde, não conversa e não
pontua candidato sozinho.

## Stack

Next.js 15 (App Router, TypeScript), Postgres no Neon, Prisma, Tailwind CSS, deploy na Vercel.
Sem biblioteca de componentes.

## Telas

| Rota        | O que faz |
| ----------- | --------- |
| `/login`    | Senha única compartilhada |
| `/`         | Pipeline: cartões de resumo, filtro por vaga e status, busca por nome ou telefone, lista ordenada por pontuação, detalhe expansível e status editável direto na lista |
| `/nova`     | Formulário de triagem com pontuação ao vivo e o roteiro da ligação num painel fixo ao lado |
| `/whatsapp` | Caixa de entrada das mensagens recebidas, não processadas primeiro, com botão para virar triagem |
| `/candidato/[id]/editar` | Edição da triagem, com recálculo da pontuação ao salvar |

## Quem está usando

O login é uma senha só para as três pessoas do escritório, então não existe conta individual. No
topo da tela tem um seletor com Angelo, Nayara e Sara. A escolha fica salva no navegador e serve
para duas coisas: preencher o campo de quem triou por padrão e registrar o autor nas mudanças de
status. Não é controle de acesso, é rastreabilidade mínima.

## Régua de pontuação

Score de 0 a 100, soma de 8 critérios. A régua vive em `src/lib/pontuacao.ts` e é a fonte única:
o formulário monta os selects a partir dela e a API recalcula tudo no servidor ao salvar,
ignorando qualquer pontuação enviada pelo navegador.

| Critério | Peso | Opções e pontos |
| --- | --- | --- |
| Experiência na função | 25 | Nenhuma 0, Menos de 1 ano 8, 1 a 3 anos 16, Mais de 3 anos 25 |
| Consistência no histórico | 15 | Primeiro emprego 8, Menos de 6 meses 5, 6 meses a 2 anos 10, Mais de 2 anos 15 |
| Mobilidade até a obra | 15 | Perto até 30 min 15, Média até 1h 10, Longe ou depende de carona 3 |
| Ferramentas próprias | 10 | Completas 10, Parcial 5, Nenhuma 0 |
| Documentação | 15 | Completa 15, Parcial 7, Nenhuma 0 |
| Referências verificáveis | 10 | Tem e dá pra verificar 10, Tem mas não verificada 5, Não tem 0 |
| Disponibilidade pra começar | 5 | Imediata 5, 1 a 2 semanas 3, Mais de 1 mês 0 |
| Pretensão salarial | 5 | Dentro da faixa 5, Acima 0, Não informou 2 |

Faixas de resultado:

- 80 a 100: avançar para teste prático, status sugerido `Teste prático`
- 60 a 79: agendar entrevista, status sugerido `Entrevista marcada`
- 40 a 59: banco de reserva, status sugerido `Banco de reserva`
- abaixo de 40: não avançar agora, status sugerido `Novo`

Regra fixa acima de tudo: com a consulta de antecedentes marcada como `Reprovada`, o status vira
`Reprovado` na hora, a tela mostra um aviso vermelho e a API recusa qualquer tentativa de mudar
esse status depois. O campo de antecedentes é controle interno do escritório e nunca aparece em
nada voltado ao candidato.

## Segurança do trabalho

Três campos ficam fora da régua de propósito, porque a régua é a que a equipe já usa: uso de EPI,
treinamento de NR e trabalho em altura. Eles não somam nem tiram ponto, mas levantam alerta na
tela. Um candidato que diz não trabalhar em altura na vaga de pintor recebe aviso vermelho, porque
fachada e andaime são a maior parte do serviço. NR-35 vencida ou inexistente vira aviso amarelo.

Se um dia a equipe quiser que isso pontue, a mudança é em `src/lib/pontuacao.ts`, num lugar só.

## Exportar, editar e excluir

- O botão Exportar CSV no pipeline baixa exatamente o que está filtrado na tela, com separador
  ponto e vírgula, pronto para abrir no Excel em português.
- Cada candidato tem Editar triagem no detalhe. A pontuação é recalculada ao salvar e a mudança de
  status entra no histórico.
- Excluir apaga o candidato de vez, com confirmação. Serve para atender pedido de remoção de dados
  e para limpar duplicidade. A mensagem de WhatsApp ligada a ele volta para a caixa de entrada.

## Dados de demonstração

```bash
npm run db:seed
```

Apaga tudo e recria doze candidatos e quatro mensagens de WhatsApp para a equipe ver o app cheio.
Nunca rode isso no banco de produção depois que a equipe começar a usar de verdade.

## Variáveis de ambiente

| Variável | Onde configurar | Para que serve |
| --- | --- | --- |
| `DATABASE_URL` | local e Vercel | Connection string do Neon com pooler, usada pelo app |
| `DIRECT_URL` | local e Vercel | Connection string direta do Neon, sem pooler, usada só pelas migrations |
| `APP_PASSWORD` | local e Vercel | Senha única de acesso da equipe |
| `WHATSAPP_VERIFY_TOKEN` | local e Vercel | Token que você inventa e repete no painel da Meta ao ligar o webhook |
| `WHATSAPP_APP_SECRET` | opcional | App Secret do app da Meta. Se preenchido, o webhook confere a assinatura de cada POST e recusa o que não vier da Meta |

Copie `.env.example` para `.env` e preencha. O arquivo `.env` não vai para o Git.

## Rodando local

```bash
npm install
cp .env.example .env    # preencha DATABASE_URL, DIRECT_URL e APP_PASSWORD
npx prisma migrate dev  # cria as tabelas
npm run db:seed         # opcional, popula com dados de demonstração
npm run dev             # http://localhost:3000
```

O banco pode ser o mesmo do Neon ou um Postgres local. Para criar um banco novo no Neon:

1. Crie a conta em neon.tech e um projeto na região `sa-east-1` (São Paulo).
2. Em Connection Details, copie a string com `-pooler` no host para `DATABASE_URL`.
3. Desmarque a opção de pooler e copie a string direta para `DIRECT_URL`.
4. Rode `npx prisma migrate deploy` apontando para esse banco.

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel, importe o repositório. O framework Next.js é detectado sozinho.
3. Em Settings, Environment Variables, cadastre `DATABASE_URL`, `DIRECT_URL`, `APP_PASSWORD` e
   `WHATSAPP_VERIFY_TOKEN` nos três ambientes (Production, Preview, Development).
4. Faça o deploy. O script de build já roda `prisma generate`.
5. Aplique as migrations no banco de produção uma vez, da sua máquina:
   `npx prisma migrate deploy` com o `.env` apontando para o banco do Neon.
6. Anote a URL de produção. Ela é necessária no passo do WhatsApp.

Toda vez que o schema do Prisma mudar, rode `npx prisma migrate deploy` de novo contra o banco de
produção depois do deploy.

## WhatsApp: o que você precisa fazer no Meta

Essa parte é manual, feita na sua conta do Meta. O código já está pronto do lado do app:
`/api/webhook/whatsapp` responde ao GET de verificação e grava as mensagens do POST.

Faça isso depois do deploy, porque a Meta exige uma URL pública em HTTPS.

1. **Conta no Meta Business**. Entre em business.facebook.com e garanta que a Angelo Pinturas
   tem uma conta comercial. Se já usa o gerenciador de anúncios, ela existe.
2. **Criar o app**. Em developers.facebook.com, vá em Meus apps, Criar app, escolha o tipo voltado
   para empresas e vincule o app à conta comercial da Angelo Pinturas.
3. **Adicionar o produto WhatsApp**. No painel do app, adicione o produto WhatsApp. A Meta cria uma
   conta do WhatsApp Business de teste e um número de teste para você começar sem usar o número
   real da empresa.
4. **Definir o verify token**. Escolha uma frase qualquer, por exemplo
   `angelo-pinturas-2026-triagem`. Cadastre ela como `WHATSAPP_VERIFY_TOKEN` na Vercel e faça
   um redeploy para a variável valer.
5. **Configurar o webhook**. Em WhatsApp, Configuração, seção Webhook, clique em Editar e preencha:
   - URL de callback: `https://SEU-DOMINIO.vercel.app/api/webhook/whatsapp`
   - Token de verificação: exatamente o mesmo valor do passo 4

   Salve. A Meta chama a URL na hora com um GET e mostra erro se o token não bater. Se der erro,
   confira se a variável foi salva na Vercel e se você fez o redeploy.
6. **Assinar o campo de mensagens**. Ainda no webhook, clique em Gerenciar e marque o campo
   `messages`. Sem isso a Meta verifica a URL mas não envia nada.
7. **Testar**. Ainda na tela de configuração, adicione o seu celular como número de teste
   autorizado e mande uma mensagem para o número de teste da Meta. A mensagem deve aparecer em
   `/whatsapp` em alguns segundos.
8. **Opcional, mas recomendado**. Em Configurações do app, Básico, copie a Chave Secreta do App e
   cadastre como `WHATSAPP_APP_SECRET` na Vercel. Com ela preenchida, o webhook passa a recusar
   qualquer POST que não venha assinado pela Meta. Sem ela, a URL aceita qualquer POST bem
   formado, e alguém que descubra o endereço consegue poluir sua caixa de entrada.
9. **Passar para o número real**. Quando quiser sair do número de teste: verifique a empresa no
   Meta Business, adicione o número oficial da Angelo Pinturas em WhatsApp, Gerenciar números, e
   conclua a verificação por SMS ou ligação. Um número já em uso no app WhatsApp comum precisa ser
   apagado de lá antes ou migrado para a plataforma. Depois disso o app sai do modo de
   desenvolvimento e o webhook passa a receber de qualquer pessoa.

Token de acesso não é necessário nesta fase. Ele só entra quando existir envio de mensagem,
que é a fase 2.

Os nomes dos menus no painel da Meta mudam de tempos em tempos. Se algum item estiver com outro
nome, procure pela seção WhatsApp e por Webhook dentro dela.

## Notas de operação

- A sessão dura 12 horas. Trocar o `APP_PASSWORD` derruba todo mundo na hora, porque o cookie é
  assinado com a senha.
- O endpoint de login tem um freio de 10 tentativas a cada 10 minutos por IP.
- O webhook ignora reenvio da Meta quando chega o mesmo telefone com o mesmo texto em menos de
  dois minutos.
- O pipeline carrega no máximo 300 candidatos por consulta. Para volume maior, use os filtros.
- Não existe expurgo automático de candidato antigo. Se a empresa definir um prazo de guarda, hoje
  a limpeza é manual pelo botão Excluir.

## Fora de escopo nesta versão

Login individual por pessoa, bot que responde ou pontua no WhatsApp e integração com Gupy, Catho
ou Indeed.
