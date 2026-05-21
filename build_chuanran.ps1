# ============================================================
# build_chuanran.ps1
# Combines chuanran_frame.html + 傳染病_完整題庫.json
# Output: chuanran.html (offline-ready, all data embedded)
#
# Run from PowerShell:
#   cd "C:\Users\weiti\Desktop\my project\VetExamQuiz\quiz_deploy"
#   powershell -ExecutionPolicy Bypass -File build_chuanran.ps1
# ============================================================

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$frameFile  = "$PSScriptRoot\chuanran_frame.html"
$jsonFile   = "C:\Users\weiti\Desktop\my project\VetExamQuiz\question_bank\04_傳染病\傳染病_完整題庫.json"
$outputFile = "$PSScriptRoot\chuanran.html"

Write-Host "[1/4] Reading HTML frame..." -ForegroundColor Cyan
if (-not (Test-Path $frameFile)) { Write-Error "Frame file not found: $frameFile"; exit 1 }
$frame = [System.IO.File]::ReadAllText($frameFile, [System.Text.Encoding]::UTF8)

Write-Host "[2/4] Reading JSON question bank..." -ForegroundColor Cyan
if (-not (Test-Path $jsonFile)) { Write-Error "JSON file not found: $jsonFile"; exit 1 }
$jsonData = [System.IO.File]::ReadAllText($jsonFile, [System.Text.Encoding]::UTF8)

Write-Host "[3/4] Merging and writing output..." -ForegroundColor Cyan
$output = $frame.Replace('__JSON_DATA__', $jsonData)
[System.IO.File]::WriteAllText($outputFile, $output, [System.Text.Encoding]::UTF8)

# Stats
$fileSizeMB = [math]::Round((Get-Item $outputFile).Length / 1MB, 1)
$qCount = ([regex]::Matches($jsonData, '"sourceType"\s*:')).Count
$years  = ([regex]::Matches($jsonData, '"roc_year"\s*:\s*\d+')).Value |
          ForEach-Object { ($_ -replace '[^\d]','') } | Sort-Object -Unique

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " BUILD COMPLETE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host " Output : $outputFile"
Write-Host " Size   : ${fileSizeMB} MB"
Write-Host " Questions: $qCount"
Write-Host " Years    : $($years -join ', ')"
Write-Host "============================================" -ForegroundColor Green
