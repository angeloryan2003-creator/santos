# Configuracao do app de triagem da Angelo Pinturas neste computador.
#
# Como rodar, dentro da pasta do projeto, no PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\configurar.ps1
#
# O script confere o Node, pede as conexoes do Neon, cria o arquivo .env,
# instala as dependencias, cria as tabelas e liga o app.

$ErrorActionPreference = 'Stop'

function Passo($texto) { Write-Host "`n$texto" -ForegroundColor Cyan }
function Ok($texto) { Write-Host "  $texto" -ForegroundColor Green }
function Aviso($texto) { Write-Host "  $texto" -ForegroundColor Yellow }
function Erro($texto) { Write-Host "  $texto" -ForegroundColor Red }

Write-Host "=== Angelo Pinturas, triagem de candidatos ===" -ForegroundColor White

# 1. Conferir se estamos na pasta certa -------------------------------------
Passo "1. Conferindo a pasta"
if (-not (Test-Path 'package.json')) {
    Erro "Este script precisa rodar de dentro da pasta do projeto."
    Erro "Va ate a pasta com o comando cd e rode de novo. Exemplo:"
    Erro "  cd `$HOME\Documents\santos"
    exit 1
}
Ok "Pasta correta."

# 2. Conferir o Node --------------------------------------------------------
Passo "2. Conferindo o Node"
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Erro "O Node nao esta instalado, ou este PowerShell foi aberto antes da instalacao."
    Erro "Baixe a versao LTS em https://nodejs.org, instale, feche este PowerShell,"
    Erro "abra outro e rode este script de novo."
    exit 1
}
$versao = (& node -v)
Ok "Node $versao encontrado."

# 3. Arquivo .env -----------------------------------------------------------
Passo "3. Configuracao de acesso"

$recriar = $true
if (Test-Path '.env') {
    Aviso "Ja existe um arquivo .env nesta pasta."
    $resposta = Read-Host "  Quer refazer a configuracao? Digite s para refazer, ou Enter para manter"
    if ($resposta -ne 's' -and $resposta -ne 'S') {
        $recriar = $false
        Ok "Mantendo a configuracao atual."
    }
}

if ($recriar) {
    Write-Host ""
    Write-Host "  Abra o painel do Neon, em Connect, e copie a linha de conexao." -ForegroundColor White
    Write-Host "  Ela comeca com postgresql:// e e bem longa." -ForegroundColor White
    Write-Host ""

    $principal = ''
    while ($principal -notlike 'postgres*') {
        $principal = (Read-Host "  Cole a conexao COM pooling (a que tem -pooler)").Trim().Trim('"')
        if ($principal -notlike 'postgres*') { Erro "Isso nao parece uma conexao. Ela comeca com postgresql://" }
    }

    Write-Host ""
    Write-Host "  Agora desligue a chave Connection pooling no Neon e copie de novo." -ForegroundColor White
    Write-Host "  Se o seu painel nao tiver essa chave, so apertar Enter que eu uso a mesma." -ForegroundColor White
    $direta = (Read-Host "  Cole a conexao SEM pooling, ou Enter para repetir a anterior").Trim().Trim('"')
    if ([string]::IsNullOrWhiteSpace($direta)) { $direta = $principal }

    Write-Host ""
    $senha = ''
    while ($senha.Length -lt 6) {
        $senha = (Read-Host "  Escolha a senha de acesso ao app, no minimo 6 caracteres").Trim()
        if ($senha.Length -lt 6) { Erro "Senha muito curta." }
    }

    $conteudo = @(
        "DATABASE_URL=`"$principal`"",
        "DIRECT_URL=`"$direta`"",
        "APP_PASSWORD=`"$senha`"",
        "WHATSAPP_VERIFY_TOKEN=`"angelo-pinturas-webhook`""
    ) -join "`n"

    # Gravado sem BOM, porque o leitor de variaveis nao aceita BOM na primeira linha.
    $codificacao = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) '.env'), $conteudo + "`n", $codificacao)
    Ok "Arquivo .env criado."
}

# 4. Dependencias -----------------------------------------------------------
Passo "4. Instalando as dependencias, isso demora um ou dois minutos"
& npm install
if ($LASTEXITCODE -ne 0) {
    Erro "A instalacao falhou. Confira sua conexao com a internet e rode o script de novo."
    exit 1
}
Ok "Dependencias instaladas."

# 5. Tabelas ----------------------------------------------------------------
Passo "5. Criando as tabelas no banco"
& npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Erro "Nao consegui falar com o banco."
    Erro "Quase sempre e a linha de conexao incompleta. Rode o script de novo e cole a linha inteira."
    exit 1
}
Ok "Banco pronto."

# 6. Dados de exemplo -------------------------------------------------------
Passo "6. Dados de exemplo"
Aviso "Isso APAGA tudo o que estiver no banco e cria 12 candidatos de mentira, so para voce ver o app cheio."
$exemplo = Read-Host "  Quer os dados de exemplo? Digite s para sim, ou Enter para pular"
if ($exemplo -eq 's' -or $exemplo -eq 'S') {
    & npm run db:seed
    Ok "Dados de exemplo criados."
} else {
    Ok "Pulado, o banco fica vazio."
}

# 7. Ligar ------------------------------------------------------------------
Passo "7. Ligando o app"
Write-Host "  Em alguns segundos o navegador abre em http://localhost:3000" -ForegroundColor White
Write-Host "  Para parar o app, volte aqui e aperte Ctrl+C." -ForegroundColor White
Write-Host "  Para ligar de novo depois, rode: .\iniciar.ps1" -ForegroundColor White

try {
    Start-Job -ScriptBlock {
        Start-Sleep -Seconds 12
        Start-Process 'http://localhost:3000'
    } | Out-Null
} catch {
    Write-Host "  Nao consegui abrir o navegador sozinho. Abra http://localhost:3000 na mao." -ForegroundColor Yellow
}

& npm run dev
