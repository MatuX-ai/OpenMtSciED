# iMato 项目一键启动脚本
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "iMato Project - One-Click Startup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python
try {
    $pythonVersion = & "G:\Python312\python.exe" --version 2>&1
    Write-Host "[✓] Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Python not found!" -ForegroundColor Red
    exit 1
}

# 检查 Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[✓] Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# 启动后端
Write-Host "[1/2] Starting Backend (http://localhost:8000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"
Start-Sleep -Seconds 5

# 启动前端
Write-Host "[2/2] Starting Frontend (http://localhost:4200)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run serve"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  • Frontend:  http://localhost:4200" -ForegroundColor White
Write-Host "  • Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  • API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To stop services: Close the terminal windows" -ForegroundColor Gray
Write-Host ""
