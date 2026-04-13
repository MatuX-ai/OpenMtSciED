# 本地数据存储功能 - 快速验证脚本
# 使用方法: .\verify_storage.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  本地数据存储功能验证" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$successCount = 0
$totalTests = 0

function Test-Feature {
    param(
        [string]$name,
        [scriptblock]$test
    )

    $totalTests++
    Write-Host "测试 $totalTests`: $name" -NoNewline

    try {
        $result = & $test
        if ($result) {
            Write-Host " ✓" -ForegroundColor Green
            $script:successCount++
            return $true
        } else {
            Write-Host " ✗" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host " ✗ (错误: $_)" -ForegroundColor Red
        return $false
    }
}

# 测试 1: Rust 源文件存在
Test-Feature "Rust storage.rs 文件存在" {
    Test-Path "src-tauri\src\commands\storage.rs"
}

# 测试 2: Settings 组件存在
Test-Feature "Settings 组件文件存在" {
    Test-Path "src\app\features\settings\settings.component.ts"
}

# 测试 3: Dashboard 组件存在
Test-Feature "Dashboard 组件文件存在" {
    Test-Path "src\app\features\dashboard\dashboard.component.ts"
}

# 测试 4: Cargo.toml 包含依赖
Test-Feature "Cargo.toml 包含 fs2 依赖" {
    $content = Get-Content "src-tauri\Cargo.toml" -Raw
    $content -match 'fs2\s*=\s*"0\.4"'
}

Test-Feature "Cargo.toml 包含 walkdir 依赖" {
    $content = Get-Content "src-tauri\Cargo.toml" -Raw
    $content -match 'walkdir\s*=\s*"2"'
}

# 测试 5: lib.rs 注册命令
Test-Feature "lib.rs 注册 get_storage_info" {
    $content = Get-Content "src-tauri\src\lib.rs" -Raw
    $content -match 'commands::storage::get_storage_info'
}

Test-Feature "lib.rs 注册 get_folder_size" {
    $content = Get-Content "src-tauri\src\lib.rs" -Raw
    $content -match 'commands::storage::get_folder_size'
}

# 测试 6: lib.rs 创建目录
Test-Feature "lib.rs 创建 materials 目录" {
    $content = Get-Content "src-tauri\src\lib.rs" -Raw
    $content -match 'materials_dir'
}

Test-Feature "lib.rs 创建 backups 目录" {
    $content = Get-Content "src-tauri\src\lib.rs" -Raw
    $content -match 'backup_dir'
}

# 测试 7: TauriService 包含方法
Test-Feature "TauriService 包含 getStorageInfo" {
    $content = Get-Content "src\app\core\services\tauri.service.ts" -Raw
    $content -match 'async getStorageInfo\(\)'
}

Test-Feature "TauriService 包含 getFolderSize" {
    $content = Get-Content "src\app\core\services\tauri.service.ts" -Raw
    $content -match 'async getFolderSize\(path: string\)'
}

# 测试 8: StorageInfo 接口定义
Test-Feature "TauriService 定义 StorageInfo 接口" {
    $content = Get-Content "src\app\core\services\tauri.service.ts" -Raw
    $content -match 'export interface StorageInfo'
}

# 测试 9: 路由配置
Test-Feature "路由配置包含 /settings" {
    $content = Get-Content "src\app\app.routes.ts" -Raw
    $content -match "path:\s*'settings'"
}

Test-Feature "路由配置包含 /dashboard" {
    $content = Get-Content "src\app\app.routes.ts" -Raw
    $content -match "path:\s*'dashboard'"
}

# 测试 10: Setup Wizard 包含步骤3
Test-Feature "Setup Wizard 包含 dataPath 属性" {
    $content = Get-Content "src\app\features\setup-wizard\setup-wizard.component.ts" -Raw
    $content -match 'dataPath\s*='
}

Test-Feature "Setup Wizard 包含 materialsPath 属性" {
    $content = Get-Content "src\app\features\setup-wizard\setup-wizard.component.ts" -Raw
    $content -match 'materialsPath\s*='
}

# 测试 11: 编译产物
Test-Feature "Rust 编译产物存在" {
    Test-Path "src-tauri\target\release\app.exe"
}

# 显示总结
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  验证结果" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "通过: $successCount / $totalTests" -ForegroundColor $(if ($successCount -eq $totalTests) { 'Green' } else { 'Yellow' })

if ($successCount -eq $totalTests) {
    Write-Host "`nAll tests passed! Storage feature implemented correctly." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Restart application to create directories" -ForegroundColor White
    Write-Host "2. Visit http://localhost:4200/ to complete wizard" -ForegroundColor White
    Write-Host "3. Check settings page for storage info" -ForegroundColor White
} else {
    Write-Host "`nSome tests failed. Please check errors above." -ForegroundColor Red
}

Write-Host ""
