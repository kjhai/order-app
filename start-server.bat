@echo off
chcp 65001 >nul
echo 커피 주문 앱 서버를 시작합니다...
echo.
cd /d "%~dp0\ui"
npm run dev
pause

