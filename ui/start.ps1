# 커피 주문 앱 서버 시작 스크립트
Write-Host "커피 주문 앱 서버를 시작합니다..." -ForegroundColor Green
Write-Host ""

Set-Location $PSScriptRoot
npm run dev

Write-Host ""
Write-Host "서버를 종료하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow

