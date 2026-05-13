# OpenMTSciEd API 测试脚本
# 使用前请确保后端服务已启动 (npm run dev)

$baseUrl = "http://localhost:3000/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenMTSciEd API 测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 健康检查
Write-Host "1. 测试健康检查 API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ 健康检查成功:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Gray
} catch {
    Write-Host "❌ 健康检查失败: $_" -ForegroundColor Red
}
Write-Host ""

# 2. 获取教程列表
Write-Host "2. 测试获取教程列表 API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/tutorials?page=1&size=5" -Method Get
    Write-Host "✅ 教程列表获取成功:" -ForegroundColor Green
    Write-Host "总数: $($response.total), 当前页: $($response.page)" -ForegroundColor Gray
    if ($response.items.Count -gt 0) {
        Write-Host "第一个教程: $($response.items[0].title)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ 教程列表获取失败: $_" -ForegroundColor Red
}
Write-Host ""

# 3. 按科目筛选教程
Write-Host "3. 测试按科目筛选教程..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/tutorials?subject=physics&page=1&size=5" -Method Get
    Write-Host "✅ 物理科目教程获取成功:" -ForegroundColor Green
    Write-Host "找到 $($response.total) 个物理教程" -ForegroundColor Gray
} catch {
    Write-Host "❌ 筛选失败: $_" -ForegroundColor Red
}
Write-Host ""

# 4. 创建教程 (POST)
Write-Host "4. 测试创建教程 API..." -ForegroundColor Yellow
try {
    $body = @{
        id = "tutorial_test_$(Get-Date -Format 'yyyyMMddHHmmss')"
        title = "测试教程 - 牛顿运动定律"
        description = "这是一个测试教程"
        grade_level = "9-12"
        subject = "physics"
        duration_minutes = 60
        difficulty_level = "intermediate"
        content = "测试内容"
    }
    $jsonBody = $body | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/tutorials" -Method Post -Body $jsonBody -ContentType "application/json"
    Write-Host "✅ 教程创建成功:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Gray
} catch {
    Write-Host "❌ 教程创建失败: $_" -ForegroundColor Red
}
Write-Host ""

# 5. 获取课件列表
Write-Host "5. 测试获取课件列表 API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/coursewares?page=1&size=5" -Method Get
    Write-Host "✅ 课件列表获取成功:" -ForegroundColor Green
    Write-Host "总数: $($response.total)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 课件列表获取失败: $_" -ForegroundColor Red
}
Write-Host ""

# 6. 生成学习路径
Write-Host "6. 测试生成学习路径 API..." -ForegroundColor Yellow
try {
    $body = @{
        user_id = 1
        current_grade = "9-12"
        subjects = @("physics")
        learning_goals = @("mechanics")
    }
    $jsonBody = $body | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/knowledge-graph/path" -Method Post -Body $jsonBody -ContentType "application/json"
    Write-Host "✅ 学习路径生成成功:" -ForegroundColor Green
    Write-Host "路径ID: $($response.path_id)" -ForegroundColor Gray
    Write-Host "节点数量: $($response.nodes.Count)" -ForegroundColor Gray
    Write-Host "预计时长: $($response.estimated_duration_hours) 小时" -ForegroundColor Gray
} catch {
    Write-Host "❌ 学习路径生成失败: $_" -ForegroundColor Red
}
Write-Host ""

# 7. 获取资源推荐
Write-Host "7. 测试资源推荐 API..." -ForegroundColor Yellow
try {
    $body = @{
        user_id = 1
        limit = 5
        subjects = @("physics", "mathematics")
    }
    $jsonBody = $body | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/knowledge-graph/recommend" -Method Post -Body $jsonBody -ContentType "application/json"
    Write-Host "✅ 资源推荐获取成功:" -ForegroundColor Green
    Write-Host "推荐策略: $($response.strategy)" -ForegroundColor Gray
    Write-Host "推荐数量: $($response.recommendations.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 资源推荐获取失败: $_" -ForegroundColor Red
}
Write-Host ""

# 8. 获取硬件项目列表
Write-Host "8. 测试获取硬件项目列表 API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/hardware-projects?page=1&size=5" -Method Get
    Write-Host "✅ 硬件项目列表获取成功:" -ForegroundColor Green
    Write-Host "总数: $($response.total)" -ForegroundColor Gray
} catch {
    Write-Host "❌ 硬件项目列表获取失败: $_" -ForegroundColor Red
}
Write-Host ""

# 9. 按难度筛选硬件项目
Write-Host "9. 测试按难度筛选硬件项目..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/hardware-projects?difficulty=beginner&page=1&size=5" -Method Get
    Write-Host "✅ 初级硬件项目获取成功:" -ForegroundColor Green
    Write-Host "找到 $($response.total) 个初级项目" -ForegroundColor Gray
} catch {
    Write-Host "❌ 筛选失败: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
