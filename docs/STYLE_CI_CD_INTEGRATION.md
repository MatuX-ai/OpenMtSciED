# 样式工程化 CI/CD 配置示例

## GitHub Actions 配置

```yaml
# .github/workflows/style-engineering.yml
name: Style Engineering Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  style-analysis:
    name: 样式工程化分析
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: 代码质量检查
      run: |
        npm run lint:css
        npm run lint:css-report > stylelint-report.txt
    
    - name: 样式覆盖率分析
      run: |
        npm run build
        npm run analyze:coverage:export
        
    - name: 上传分析报告
      uses: actions/upload-artifact@v3
      with:
        name: style-analysis-report
        path: |
          stylelint-report.txt
          style-coverage-report.json
          dist/styles/
    
    - name: 检查覆盖率阈值
      run: |
        # 读取覆盖率报告
        COVERAGE=$(jq -r '.summary.coveragePercentage' style-coverage-report.json)
        THRESHOLD=70
        
        echo "当前样式覆盖率: $COVERAGE%"
        echo "最低要求覆盖率: $THRESHOLD%"
        
        if (( $(echo "$COVERAGE < $THRESHOLD" | bc -l) )); then
          echo "::error::样式覆盖率 $COVERAGE% 低于阈值 $THRESHOLD%"
          exit 1
        fi
    
    - name: 生成样式文档
      run: |
        npm run docs:styles
        
    - name: 部署文档 (仅主分支)
      if: github.ref == 'refs/heads/main'
      run: |
        # 这里可以添加文档部署逻辑
        echo "文档生成完成，可部署到 GitHub Pages 或其他平台"
```

## GitLab CI 配置

```yaml
# .gitlab-ci.yml
stages:
  - test
  - analyze
  - deploy

stylelint:
  stage: test
  image: node:16
  script:
    - npm ci
    - npm run lint:css
    - npm run lint:css-report > stylelint-report.txt
  artifacts:
    reports:
      junit: stylelint-report.txt
    paths:
      - stylelint-report.txt

style-coverage:
  stage: analyze
  image: node:16
  script:
    - npm run build
    - npm run analyze:coverage:export
  artifacts:
    paths:
      - style-coverage-report.json
    reports:
      coverage_report:
        coverage_format: cobertura
        path: style-coverage-report.json

documentation:
  stage: deploy
  image: node:16
  script:
    - npm run docs:styles
  only:
    - main
  artifacts:
    paths:
      - docs/styles/sassdoc/
```

## 样式质量门禁配置

### package.json 脚本增强

```json
{
  "scripts": {
    "quality:gate": "npm run lint:css && npm run analyze:coverage:ci",
    "pre-commit": "npm run quality:gate",
    "pre-push": "npm run quality:gate && npm run docs:build"
  }
}
```

### husky 预提交钩子配置

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 运行样式质量检查..."
npm run quality:gate

if [ $? -ne 0 ]; then
  echo "❌ 样式质量检查失败，请修复问题后再提交"
  exit 1
fi

echo "✅ 样式质量检查通过"
```

## 样式性能监控

### webpack 配置示例

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'css-bundle-analysis.html',
      openAnalyzer: false
    })
  ]
};
```

### 样式大小监控脚本

```javascript
// scripts/style-size-monitor.js
const fs = require('fs');
const path = require('path');

function analyzeStyleSizes() {
  const distDir = path.join(__dirname, '../dist/styles');
  const files = fs.readdirSync(distDir);
  
  const results = files
    .filter(file => file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      const sizeInKB = (stats.size / 1024).toFixed(2);
      
      return {
        file,
        size: `${sizeInKB} KB`,
        bytes: stats.size
      };
    })
    .sort((a, b) => b.bytes - a.bytes);
  
  console.log('CSS 文件大小分析:');
  results.forEach(result => {
    const warning = result.bytes > 100 * 1024 ? ' ⚠️' : '';
    console.log(`${result.file}: ${result.size}${warning}`);
  });
  
  const totalSize = results.reduce((sum, file) => sum + file.bytes, 0);
  console.log(`\n总计: ${(totalSize / 1024).toFixed(2)} KB`);
  
  if (totalSize > 300 * 1024) {
    console.error('❌ CSS 总大小超过 300KB 阈值');
    process.exit(1);
  }
}

analyzeStyleSizes();
```

## 自动化清理未使用样式

### PurgeCSS 集成配置

```javascript
// purgecss.config.js
module.exports = {
  content: [
    'src/**/*.{html,ts,js,jsx}',
    'shared-styles/**/*.{ts,html}',
    'flutter_app/**/*.{dart}'
  ],
  css: [
    'dist/styles/**/*.css'
  ],
  safelist: {
    standard: [
      /^c-/,           // 保留所有组件类
      /^u-/,           // 保留所有工具类
      /^t-/,           // 保留所有主题类
      /^mat-/,         // 保留 Angular Material 类
      /^ng-/,          // 保留 Angular 类
      'active',
      'disabled',
      'focus',
      'hover'
    ],
    deep: [
      /^data-.*/,
      /^aria-.*/
    ]
  },
  keyframes: true,
  variables: true
};
```

### 构建流程集成

```json
{
  "scripts": {
    "build:optimized": "npm run build && npm run purge:css",
    "purge:css": "purgecss --config ./purgecss.config.js --output dist/styles/"
  }
}
```

## 样式变更影响分析

### Git hooks 配置

```bash
# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 检查提交消息格式
if ! grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: " "$1"; then
  echo "❌ 提交消息格式不正确"
  echo "请使用 conventional commits 格式"
  exit 1
fi
```

### 样式变更检测脚本

```javascript
// scripts/style-change-detector.js
const { execSync } = require('child_process');
const fs = require('fs');

function detectStyleChanges() {
  try {
    // 获取上次提交的文件列表
    const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    
    const styleFiles = changedFiles
      .split('\n')
      .filter(file => 
        file.endsWith('.scss') || 
        file.endsWith('.css') || 
        file.includes('/styles/')
      );
    
    if (styleFiles.length > 0) {
      console.log('🎨 检测到样式文件变更:');
      styleFiles.forEach(file => console.log(`  • ${file}`));
      
      // 运行相关检查
      console.log('\n🔍 运行样式质量检查...');
      execSync('npm run quality:gate', { stdio: 'inherit' });
      
      // 生成变更影响报告
      generateImpactReport(styleFiles);
    }
    
  } catch (error) {
    console.error('样式变更检测失败:', error.message);
  }
}

function generateImpactReport(changedFiles) {
  const report = {
    timestamp: new Date().toISOString(),
    changedFiles: changedFiles,
    affectedComponents: [],
    recommendations: []
  };
  
  // 分析受影响的组件
  changedFiles.forEach(file => {
    if (file.includes('components/')) {
      const componentName = file.match(/components\/([^\/]+)/)?.[1];
      if (componentName) {
        report.affectedComponents.push(componentName);
      }
    }
  });
  
  // 生成建议
  if (report.affectedComponents.length > 0) {
    report.recommendations.push('建议测试以下组件的功能:');
    report.affectedComponents.forEach(comp => {
      report.recommendations.push(`  • ${comp} 组件`);
    });
  }
  
  fs.writeFileSync('style-change-impact.json', JSON.stringify(report, null, 2));
  console.log('📄 变更影响报告已生成: style-change-impact.json');
}

detectStyleChanges();
```

## 监控和报警

### 样式健康度仪表板配置

```javascript
// scripts/style-health-dashboard.js
const fs = require('fs');

function generateHealthDashboard() {
  const dashboard = {
    timestamp: new Date().toISOString(),
    metrics: {
      stylelintErrors: 0,
      stylelintWarnings: 0,
      coverage: 0,
      totalClasses: 0,
      unusedClasses: 0,
      cssSize: 0
    },
    status: 'healthy'
  };
  
  // 读取各种报告文件
  try {
    // Stylelint 报告
    if (fs.existsSync('stylelint-report.json')) {
      const stylelintReport = JSON.parse(fs.readFileSync('stylelint-report.json', 'utf8'));
      dashboard.metrics.stylelintErrors = stylelintReport.errors || 0;
      dashboard.metrics.stylelintWarnings = stylelintReport.warnings || 0;
    }
    
    // 覆盖率报告
    if (fs.existsSync('style-coverage-report.json')) {
      const coverageReport = JSON.parse(fs.readFileSync('style-coverage-report.json', 'utf8'));
      dashboard.metrics.coverage = coverageReport.summary.coveragePercentage;
      dashboard.metrics.totalClasses = coverageReport.summary.totalClasses;
      dashboard.metrics.unusedClasses = coverageReport.summary.unusedClasses;
    }
    
    // CSS 大小
    const cssStats = getCssSizeStats();
    dashboard.metrics.cssSize = cssStats.totalSize;
    
  } catch (error) {
    console.error('生成健康仪表板时出错:', error);
    dashboard.status = 'error';
  }
  
  // 确定整体状态
  if (dashboard.metrics.stylelintErrors > 0 || 
      dashboard.metrics.coverage < 70 || 
      dashboard.metrics.cssSize > 300) {
    dashboard.status = 'warning';
  }
  
  fs.writeFileSync('style-health-dashboard.json', JSON.stringify(dashboard, null, 2));
  console.log('📊 样式健康度仪表板已生成');
}

function getCssSizeStats() {
  // 实现 CSS 文件大小统计逻辑
  return { totalSize: 0, fileCount: 0 };
}

generateHealthDashboard();
```

这个完整的 CI/CD 配置提供了从代码质量检查到性能监控的全方位样式工程化保障。