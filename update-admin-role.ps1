# 更新admin用户角色为管理员

Write-Host "=== Updating Admin User Role ===" -ForegroundColor Green

# 首先登录获取token
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

Write-Host "`nLogging in..." -ForegroundColor Yellow
$loginResult = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $loginResult.access_token
Write-Host "Login successful, token obtained" -ForegroundColor Green

# 获取当前用户信息
Write-Host "`nGetting current user info..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$userInfo = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/me" -Method Get -Headers $headers
Write-Host "Current user role: $($userInfo.role)" -ForegroundColor Cyan

# 注意：需要通过Prisma直接更新数据库，因为没有更新用户角色的API
# 这里提供一个SQL命令示例
Write-Host "`nTo update the role to 'admin', run this SQL command:" -ForegroundColor Yellow
Write-Host "UPDATE users SET role = 'admin' WHERE username = 'admin';" -ForegroundColor Cyan

Write-Host "`n=== Complete ===" -ForegroundColor Green