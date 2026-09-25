# Rodar o app no seu computador (Windows)

Guia para ver o app funcionando na sua máquina antes de publicar. O banco fica no Neon, que é
grátis, então você não instala banco nenhum aqui. Leva uns vinte minutos na primeira vez.

O que você vai ter no fim: o app abrindo em `http://localhost:3000`, com seus dados de verdade
guardados no Neon. Só você acessa, e só enquanto o terminal estiver aberto. Para a Nayara e a
Sara usarem, aí sim é publicar na Vercel, que está em `COMO-PUBLICAR.md`.

## Caminho curto

Depois de instalar o Node e baixar o código (passos 1 e 2 abaixo), dá para fazer tudo com um
comando só. No PowerShell, dentro da pasta do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\configurar.ps1
```

O script confere o Node, pergunta as conexões do Neon e a senha que você quer, cria o arquivo de
configuração, instala tudo, cria as tabelas, pergunta se quer os dados de exemplo e liga o app,
abrindo o navegador no fim. Nos dias seguintes, para ligar de novo:

```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
```

Você ainda precisa da conta no Neon, que é o passo 3, porque é ali que ficam os dados e a conta é
sua. O resto desta página é o mesmo caminho na mão, caso prefira ver cada etapa ou o script falhe.

## 1. Instalar o Node

1. Entre em nodejs.org e baixe a versão LTS para Windows, que é o botão grande da esquerda.
2. Abra o instalador e vá clicando em avançar, aceitando tudo como vem.
3. Na tela que fala em ferramentas para módulos nativos (Tools for Native Modules), **não marque
   a caixa**. Não é necessário e demora muito.
4. Terminada a instalação, abra o PowerShell: tecla Windows, digite `powershell`, Enter.
5. Confira digitando:

   ```powershell
   node -v
   ```

   Tem que aparecer algo como `v22.x.x`. Se disser que não reconhece o comando, feche o
   PowerShell, abra de novo e repita. Se continuar, reinicie o computador.

## 2. Baixar o código

Se você já tem Git instalado, no PowerShell:

```powershell
cd $HOME\Documents
git clone -b claude/angelo-pinturas-screening-app-892odk https://github.com/angeloryan2003-creator/santos.git
cd santos
```

Na primeira vez o Git abre o navegador pedindo para você entrar no GitHub. É normal, é o seu
próprio repositório.

Se não tem Git e não quer instalar, dá para baixar o ZIP: abra o repositório no GitHub, troque a
branch para `claude/angelo-pinturas-screening-app-892odk`, clique no botão verde Code e em
Download ZIP. Extraia em Documentos e, no PowerShell, entre na pasta extraída com `cd`.

## 3. Criar o banco no Neon

1. Entre em neon.tech e clique em entrar com o GitHub.
2. Crie um projeto. No nome pode pôr `angelo-triagem`. Na região escolha a de São Paulo,
   que aparece como `aws-sa-east-1`.
3. Terminado, abra Connect ou Connection Details. Vai aparecer uma linha longa começando com
   `postgresql://`. Copie ela inteira e guarde no bloco de notas. Essa é a **primeira**.
4. Na mesma tela tem uma chave ou caixa chamada Connection pooling ou Pooled connection.
   Desligue e copie a linha de novo, que fica um pouco diferente. Essa é a **segunda**.

   A diferença entre as duas é a palavra `-pooler` no meio do endereço. Se só aparecer uma, use a
   mesma linha nas duas variáveis do próximo passo, funciona igual para teste.

Essas linhas contêm a senha do banco. Não mande por WhatsApp nem por e-mail.

## 4. Criar o arquivo de configuração

Ainda no PowerShell, dentro da pasta `santos`:

```powershell
notepad .env
```

O Bloco de Notas pergunta se quer criar o arquivo. Diga que sim e cole isto dentro, trocando os
valores:

```
DATABASE_URL="cole aqui a PRIMEIRA linha do Neon, a que tem -pooler"
DIRECT_URL="cole aqui a SEGUNDA linha do Neon, sem -pooler"
APP_PASSWORD="escolha-uma-senha-aqui"
WHATSAPP_VERIFY_TOKEN="angelo-pinturas-2026"
```

Salve com Ctrl+S e feche o Bloco de Notas. A senha do `APP_PASSWORD` é a que você vai usar para
entrar no app. Use uma que dê para passar para a equipe depois.

## 5. Instalar e ligar

Três comandos, um de cada vez:

```powershell
npm install
npx prisma migrate deploy
npm run dev
```

O primeiro demora um ou dois minutos. O segundo cria as tabelas no Neon e responde algo como
`2 migrations applied`. O terceiro sobe o app e fica rodando.

Quando aparecer `Ready`, abra o navegador em `http://localhost:3000` e entre com a senha que você
escolheu.

## 6. Ver com dados de exemplo

Se quiser olhar o pipeline cheio antes de cadastrar gente de verdade, abra um **segundo**
PowerShell, entre na pasta de novo e rode:

```powershell
cd $HOME\Documents\santos
npm run db:seed
```

Isso cria doze candidatos e quatro mensagens de teste. Atenção: esse comando **apaga tudo** o que
estiver no banco antes de criar os exemplos. Quando começar a cadastrar candidato de verdade,
nunca mais rode ele.

## 7. Usar depois

Para parar, volte no PowerShell onde o app está rodando e aperte Ctrl+C.

Para ligar de novo, sempre dois passos:

```powershell
cd $HOME\Documents\santos
npm run dev
```

Não precisa repetir `npm install` nem o `migrate` a não ser que o código mude.

## Se der problema

**`npm` não é reconhecido como comando.** O Node não foi instalado ou o PowerShell estava aberto
antes da instalação. Feche e abra de novo.

**Erro P1001, não conseguiu alcançar o banco.** A linha do Neon está errada ou incompleta.
Confira se copiou a linha inteira, incluindo o `?sslmode=require` no fim, e se ela está entre
aspas no `.env`.

**Erro dizendo que a porta 3000 está em uso.** Já tem um app rodando em outro PowerShell. Feche
o outro, ou rode `npm run dev -- -p 3001` e use `http://localhost:3001`.

**A tela fica carregando e o banco demora.** O plano grátis do Neon suspende o banco quando fica
sem uso. A primeira tela do dia pode levar uns segundos a mais. É normal.

**Erro ao entrar dizendo que APP_PASSWORD não está configurada.** O arquivo `.env` não foi salvo
na pasta certa. Ele tem que estar dentro de `santos`, do lado do `package.json`.
