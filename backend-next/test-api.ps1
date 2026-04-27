# OpenMTSciEd Next.js Backend API 测试脚本

$BASE_URL = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  OpenMTSciEd API 测试" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. 健康检查
Write-Host "1️⃣  测试健康检查..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method Get
    Write-Host "✅ 健康检查通过" -ForegroundColor Green
    Write-Host "   服务: $($response.service)" -ForegroundColor Gray
    Write-Host "   版本: $($response.version)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ 健康检查失败: $_`n" -ForegroundColor Red
}

# 2. 用户注册
Write-Host "2️⃣  测试用户注册..." -ForegroundColor Yellow
$registerBody = @{
    username = "test_user_$(Get-Random)"
    email = "test$(Get-Random)@example.com"
    password = "test123456"
    name = "测试用户"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/register" -Method Put -Body $registerBody -ContentType "application/json"
    $token = $response.access_token
    Write-Host "✅ 注册成功" -ForegroundColor Green
    Write-Host "   用户: $($response.user.username)" -ForegroundColor Gray
    Write-Host "   Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ 注册失败: $_`n" -ForegroundColor Red
    $token = $null
}

# 3. 用户登录（如果注册失败，尝试登录演示账号）
if (-not $token) {
    Write-Host "3️⃣  测试用户登录..." -ForegroundColor Yellow
    $loginBody = @{
        username = "demo_user"
        password = "demo123456"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $token = $response.access_token
        Write-Host "✅ 登录成功" -ForegroundColor Green
        Write-Host "   用户: $($response.user.username)`n" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 登录失败: $_`n" -ForegroundColor Red
        Write-Host "⚠️  跳过需要认证的测试`n" -ForegroundColor Yellow
        exit
    }
}

# 4. 获取当前用户信息
Write-Host "4️⃣  测试获取用户信息..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/me" -Method Get -Headers $headers
    Write-Host "✅ 获取用户信息成功" -ForegroundColor Green
    Write-Host "   用户名: $($response.user.username)" -ForegroundColor Gray
    Write-Host "   角色: $($response.user.role)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ 获取用户信息失败: $_`n" -ForegroundColor Red
}

# 5. 获取学习路径
Write-Host "5️⃣  测试获取学习路径..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/learning/path?limit=5" -Method Get -Headers $headers
    Write-Host "✅ 获取学习路径成功" -ForegroundColor Green
    Write-Host "   路径数量: $($response.total)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ 获取学习路径失败: $_`n" -ForegroundColor Red
}

# 6. 获取题目列表
Write-Host "6️⃣  测试获取题目列表..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/learning/questions?limit=5" -Method Get
    Write-Host "✅ 获取题目列表成功" -ForegroundColor Green
    Write-Host "   题目数量: $($response.pagination.total)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ 获取题目列表失败: $_`n" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
