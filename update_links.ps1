# 批量更新联系信息和仓库地址
$files = @(
    "website/index.html",
    "website/docs/feature-knowledge-graph.html",
    "website/docs/feature-ai-path.html",
    "website/docs/feature-hardware.html",
    "website/docs/feature-learning-path.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'https://github.com/iMato/OpenMTSciEd', 'https://github.com/MatuX-ai/OpenMtSciED'
        $content = $content -replace 'contact@imato.edu', '3936318150@qq.com'
        Set-Content $file -Value $content -NoNewline
        Write-Host "Updated: $file"
    }
}

# 更新其他文档
$otherFiles = @(
    "docs/DATA_ACQUISITION_GUIDE.md",
    "docs/OPEN_SOURCE_READINESS_REPORT.md",
    "docs/CODE_OF_CONDUCT.md",
    "docs/PROJECT_PROGRESS_OVERVIEW.md"
)

foreach ($file in $otherFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'contact@imato.edu', '3936318150@qq.com'
        Set-Content $file -Value $content -NoNewline
        Write-Host "Updated: $file"
    }
}

Write-Host "`nAll files updated successfully!"
