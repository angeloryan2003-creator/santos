# Como colocar o app no ar e acessar

Guia para quem nunca usou Neon nem Vercel. São três contas gratuitas e uns quinze minutos.
Os nomes dos botões mudam de tempos em tempos, então se algo estiver com outro nome, procure
pela seção equivalente.

No fim disso você acessa o app por um endereço tipo `triagem-angelo.vercel.app`, de qualquer
celular ou computador, com a senha que você escolher.

## 1. Banco de dados no Neon

1. Entre em neon.tech e crie a conta com o mesmo GitHub que já usa.
2. Crie um projeto. Na região, escolha a mais perto do Brasil, hoje `aws-sa-east-1` (São Paulo).
3. Terminado o projeto, abra Connection Details ou Connect. Você vai copiar duas strings:
   - a que tem `-pooler` no meio do endereço, que vai virar `DATABASE_URL`
   - a mesma sem o `-pooler`, que vai virar `DIRECT_URL` (normalmente tem uma chave para
     desligar o pooler na própria tela)
4. Guarde as duas num bloco de notas. Elas contêm a senha do banco, não mande por WhatsApp.

## 2. Criar as tabelas

Escolha um dos dois caminhos.

**Caminho A, sem instalar nada.** No Neon, abra SQL Editor. Abra o arquivo
`prisma/schema-completo.sql` deste repositório, copie tudo, cole no editor e execute. Ele cria as
duas tabelas e o histórico. Se um dia for usar as migrations do Prisma nesse mesmo banco, avise
que já está criado com `npx prisma migrate resolve --applied 20260924233732_inicial` e o mesmo
para a segunda migration.

**Caminho B, na sua máquina, se tiver Node instalado.** Clone o repositório, crie o arquivo `.env`
com as duas strings do Neon e rode:

```bash
npm install
npx prisma migrate deploy
```

## 3. Publicar na Vercel

1. Entre em vercel.com e crie a conta com o GitHub.
2. Add New, Project, e importe o repositório `santos`. Em Branch, escolha
   `claude/angelo-pinturas-screening-app-892odk` enquanto o código estiver nessa branch.
3. Antes de clicar em Deploy, abra Environment Variables e cadastre quatro:

   | Nome | Valor |
   | --- | --- |
   | `DATABASE_URL` | a string do Neon com `-pooler` |
   | `DIRECT_URL` | a string do Neon sem `-pooler` |
   | `APP_PASSWORD` | a senha que a equipe vai usar, escolhida por você |
   | `WHATSAPP_VERIFY_TOKEN` | uma frase qualquer que você inventa, por exemplo `angelo-pinturas-2026` |

   Marque as três caixas de ambiente (Production, Preview, Development) em cada uma.
4. Deploy. Em dois ou três minutos a Vercel mostra o endereço do app.

## 4. Acessar

Abra o endereço, digite a senha do `APP_PASSWORD` e pronto. Passe o endereço e a senha para a
Nayara e a Sara. No celular, dá para salvar na tela inicial pelo menu do navegador e ele abre
como se fosse aplicativo.

Para trocar a senha depois: Vercel, Settings, Environment Variables, edite `APP_PASSWORD` e faça
um redeploy. Todo mundo é desconectado na hora, inclusive quem estava logado.

## 5. Ligar o WhatsApp

Só depois que o app estiver no ar, porque a Meta exige endereço público. O passo a passo está no
README, na seção sobre o que fazer no Meta. A URL que você vai informar lá é
`https://SEU-ENDERECO.vercel.app/api/webhook/whatsapp`.

## Custo

Neon e Vercel têm plano gratuito que aguenta com folga o uso de três pessoas. O plano gratuito do
Neon suspende o banco quando fica sem uso, então a primeira tela do dia pode demorar alguns
segundos a mais. O WhatsApp Cloud API da Meta tem cobrança própria por conversa, que muda de
tempos em tempos; confira a tabela atual no site da Meta antes de ligar o número oficial.
