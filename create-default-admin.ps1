# 创建默认管理员用户

Write-Host "=== Creating Default Admin User ===" -ForegroundColor Green

$adminUser = @{
    username = "admin"
    email = "admin@openmtscied.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "`nCreating admin user..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/register" -Method Post -ContentType "application/json" -Body $adminUser
    Write-Host "PASS: Admin user created successfully" -ForegroundColor Green
    Write-Host "Username: admin" -ForegroundColor Cyan
    Write-Host "Password: admin123" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "INFO: Admin user already exists" -ForegroundColor Yellow
    } else {
        Write-Host "FAIL: Failed to create admin user: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Login ===" -ForegroundColor Green
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    Write-Host "PASS: Admin login successful" -ForegroundColor Green
    Write-Host "Token: $($loginResult.access_token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "FAIL: Admin login failed: $_" -ForegroundColor Red
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green