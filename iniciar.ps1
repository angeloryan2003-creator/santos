# Liga o app de triagem. Rode assim, dentro da pasta do projeto:
#   powershell -ExecutionPolicy Bypass -File .\iniciar.ps1

$ErrorActionPreference = 'Stop'

if (-not (Test-Path 'package.json')) {
    Write-Host "Rode este script de dentro da pasta do projeto." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path '.env')) {
    Write-Host "Falta a configuracao. Rode primeiro: .\configurar.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "Ligando o app. O navegador abre em http://localhost:3000" -ForegroundColor Cyan
Write-Host "Para parar, aperte Ctrl+C." -ForegroundColor Cyan

try {
    Start-Job -ScriptBlock {
        Start-Sleep -Seconds 8
        Start-Process 'http://localhost:3000'
    } | Out-Null
} catch {
    Write-Host "Abra http://localhost:3000 no navegador." -ForegroundColor Yellow
}

& npm run dev
