# ============================================================
# 知识图谱迁移脚本 - 一键执行完整迁移流程
# 
# 流程：
# 1. 导出数据：从 JSON 文件提取知识点和依赖关系
# 2. 导入数据：写入 PostgreSQL 并初始化闭包表
# 3. 验证数据：检查迁移结果的正确性
# ============================================================

$ErrorActionPreference = "Stop"

# 颜色定义
function Write-Step { param($msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "   [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "   [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "   [FAIL] $msg" -ForegroundColor Red }

# 工作目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Split-Path -Parent $ScriptDir
$OutputDir = Join-Path $ScriptDir "migration-output"

Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "   知识图谱迁移工具 (Neo4j JSON → PostgreSQL 闭包表)" -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "工作目录: $BackendDir"
Write-Host "输出目录: $OutputDir"

# 创建输出目录
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

# ============================================================
# 步骤 1: 导出数据
# ============================================================
Write-Step "步骤 1: 导出数据"
Write-Host "从 knowledge_graph_relationships.json 提取知识点和依赖关系..."

Set-Location $BackendDir

try {
    npx tsx scripts/export-from-json.ts
    if ($LASTEXITCODE -ne 0) { throw "导出脚本返回非零退出码" }
    Write-Success "数据导出完成"
} catch {
    Write-Fail "导出失败: $_"
    exit 1
}

# ============================================================
# 步骤 2: 导入数据
# ============================================================
Write-Step "步骤 2: 导入数据"
Write-Host "写入 PostgreSQL 并初始化闭包表..."

# 检查环境变量
if (-not (Test-Path (Join-Path $BackendDir ".env.local"))) {
    Write-Warn ".env.local 文件不存在，使用 .env.example"
    if (Test-Path (Join-Path $BackendDir ".env.example")) {
        Copy-Item (Join-Path $BackendDir ".env.example") (Join-Path $BackendDir ".env.local")
    }
}

# 确保 Prisma Client 已生成
Write-Host "确保 Prisma Client 已生成..."
npx prisma generate

try {
    npx tsx scripts/import-to-postgres.ts
    if ($LASTEXITCODE -ne 0) { throw "导入脚本返回非零退出码" }
    Write-Success "数据导入完成"
} catch {
    Write-Fail "导入失败: $_"
    exit 1
}

# ============================================================
# 步骤 3: 验证数据
# ============================================================
Write-Step "步骤 3: 验证数据"
Write-Host "检查迁移结果的正确性..."

try {
    npx tsx scripts/verify-closure.ts
    if ($LASTEXITCODE -ne 0) { 
        Write-Warn "验证未完全通过，请检查上述错误"
    } else {
        Write-Success "验证通过"
    }
} catch {
    Write-Warn "验证过程出错: $_"
}

# ============================================================
# 完成
# ============================================================
Write-Host ""
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "   迁移流程完成!" -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Magenta

Write-Host ""
Write-Host "📁 输出文件:"
Write-Host "   - $OutputDir\exported_concepts.json"
Write-Host "   - $OutputDir\exported_dependencies.json"
Write-Host "   - $OutputDir\export-summary.json"
Write-Host "   - $OutputDir\verification-report.json"

Write-Host ""
Write-Host "🔍 下一步操作:"
Write-Host "   1. 检查 verification-report.json 确认验证结果"
Write-Host "   2. 如果验证未通过，检查错误信息并修复"
Write-Host "   3. 可以通过以下命令查看数据:"
Write-Host "      npx prisma studio"
Write-Host ""

Set-Location $ScriptDir
