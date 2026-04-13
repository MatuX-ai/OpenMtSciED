#!/usr/bin/env node

/**
 * Desktop Manager 端到端测试脚本
 *
 * 这个脚本使用 Puppeteer 进行基本的 E2E 测试
 * 使用前需要安装: npm install puppeteer --save-dev
 */

const puppeteer = require('puppeteer');
const assert = require('assert');

const BASE_URL = 'http://localhost:4200';

// 测试结果
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 辅助函数：记录测试结果
function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${testName}`);
  if (message) console.log(`   ${message}`);

  testResults.tests.push({ testName, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// 辅助函数：等待元素出现
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

// 测试 1: 应用可以正常加载
async function testAppLoads(browser) {
  const page = await browser.newPage();

  try {
    console.log('\n📋 测试 1: 应用加载测试');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 10000 });

    // 检查页面标题或主要内容是否加载
    const title = await page.title();
    logTest('应用页面加载', true, `页面标题: ${title}`);

    // 检查是否重定向到 setup-wizard
    const currentUrl = page.url();
    const isSetupWizard = currentUrl.includes('setup-wizard') || currentUrl === BASE_URL + '/';
    logTest('路由重定向到初始化向导', isSetupWizard, `当前URL: ${currentUrl}`);

  } catch (error) {
    logTest('应用页面加载', false, error.message);
  } finally {
    await page.close();
  }
}

// 测试 2: 初始化向导表单验证
async function testSetupWizardForm(browser) {
  const page = await browser.newPage();

  try {
    console.log('\n📋 测试 2: 初始化向导表单测试');
    await page.goto(`${BASE_URL}/setup-wizard`, { waitUntil: 'networkidle0' });

    // 检查表单元素是否存在
    const hasTeacherName = await waitForElement(page, 'input[placeholder*="教师姓名"]');
    logTest('教师姓名字段存在', hasTeacherName);

    const hasSchoolName = await waitForElement(page, 'input[placeholder*="学校名称"]');
    logTest('学校名称字段存在', hasSchoolName);

    const hasSubjectSelect = await waitForElement(page, 'mat-select');
    logTest('学科选择器存在', hasSubjectSelect);

    const hasSubmitButton = await waitForElement(page, 'button:has-text("完成设置")');
    logTest('提交按钮存在', hasSubmitButton);

    // 测试表单验证（尝试提交空表单）
    if (hasSubmitButton) {
      await page.click('button:has-text("完成设置")');
      await page.waitForTimeout(1000);

      // 检查是否有验证错误提示
      const hasValidationErrors = await page.evaluate(() => {
        return document.querySelector('.ng-invalid') !== null;
      });
      logTest('表单验证工作', hasValidationErrors, '空表单应该显示验证错误');
    }

  } catch (error) {
    logTest('初始化向导表单测试', false, error.message);
  } finally {
    await page.close();
  }
}

// 测试 3: 课程库页面
async function testCourseLibrary(browser) {
  const page = await browser.newPage();

  try {
    console.log('\n📋 测试 3: 课程库页面测试');
    await page.goto(`${BASE_URL}/course-library`, { waitUntil: 'networkidle0' });

    // 检查页面标题
    const hasTitle = await waitForElement(page, 'h1:has-text("📚 课程库")');
    logTest('课程库页面标题', hasTitle);

    // 检查新建课程按钮
    const hasCreateButton = await waitForElement(page, 'button:has-text("新建课程")');
    logTest('新建课程按钮存在', hasCreateButton);

    // 检查课程列表容器
    const hasCourseGrid = await waitForElement(page, '.course-grid');
    logTest('课程列表容器存在', hasCourseGrid);

    // 检查是否有课程卡片或空状态
    const hasCourses = await waitForElement(page, 'mat-card', 2000);
    const hasEmptyState = await waitForElement(page, '.empty-state', 2000);
    logTest('显示课程或空状态', hasCourses || hasEmptyState);

  } catch (error) {
    logTest('课程库页面测试', false, error.message);
  } finally {
    await page.close();
  }
}

// 测试 4: 课件库页面
async function testMaterialLibrary(browser) {
  const page = await browser.newPage();

  try {
    console.log('\n📋 测试 4: 课件库页面测试');
    await page.goto(`${BASE_URL}/material-library`, { waitUntil: 'networkidle0' });

    // 检查页面标题
    const hasTitle = await waitForElement(page, 'h1:has-text("📁 课件库")');
    logTest('课件库页面标题', hasTitle);

    // 检查上传课件按钮
    const hasUploadButton = await waitForElement(page, 'button:has-text("上传课件")');
    logTest('上传课件按钮存在', hasUploadButton);

    // 检查课程筛选器
    const hasCourseFilter = await waitForElement(page, 'mat-form-field:has-text("选择课程")');
    logTest('课程筛选器存在', hasCourseFilter);

    // 检查课件列表容器
    const hasMaterialGrid = await waitForElement(page, '.material-grid');
    logTest('课件列表容器存在', hasMaterialGrid);

  } catch (error) {
    logTest('课件库页面测试', false, error.message);
  } finally {
    await page.close();
  }
}

// 测试 5: 创建课程流程
async function testCreateCourse(browser) {
  const page = await browser.newPage();

  try {
    console.log('\n📋 测试 5: 创建课程流程测试');
    await page.goto(`${BASE_URL}/course-library`, { waitUntil: 'networkidle0' });

    // 点击新建课程按钮
    const hasCreateButton = await waitForElement(page, 'button:has-text("新建课程")');
    if (!hasCreateButton) {
      logTest('打开创建对话框', false, '找不到新建课程按钮');
      return;
    }

    await page.click('button:has-text("新建课程")');
    await page.waitForTimeout(1000);

    // 检查对话框是否打开
    const dialogOpened = await waitForElement(page, '.mat-dialog-container', 3000);
    logTest('创建课程对话框打开', dialogOpened);

    if (!dialogOpened) return;

    // 填写表单
    await page.type('input[placeholder*="课程名称"]', '测试课程-E2E');
    await page.type('textarea', '这是一个自动化测试创建的课程');

    // 选择分类（需要点击 mat-select）
    const selectElements = await page.$$('mat-select');
    if (selectElements.length > 0) {
      await selectElements[0].click();
      await page.waitForTimeout(500);

      // 选择一个选项
      const options = await page.$$('mat-option');
      if (options.length > 0) {
        await options[0].click();
        await page.waitForTimeout(500);
      }
    }

    // 点击保存按钮
    const saveButton = await page.$('button:has-text("保存")');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(2000);

      // 检查对话框是否关闭
      const dialogClosed = await waitForElement(page, '.mat-dialog-container', 1000).then(() => false).catch(() => true);
      logTest('保存后对话框关闭', dialogClosed);

      // 检查课程是否出现在列表中
      const courseExists = await waitForElement(page, 'mat-card-title:has-text("测试课程-E2E")', 3000);
      logTest('新课程出现在列表中', courseExists);
    }

  } catch (error) {
    logTest('创建课程流程测试', false, error.message);
  } finally {
    await page.close();
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始 Desktop Manager E2E 测试\n');
  console.log('=' .repeat(60));

  let browser;

  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: false, // 设置为 true 可以在无头模式运行
      slowMo: 100, // 减慢操作速度以便观察
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('✓ 浏览器启动成功\n');

    // 运行所有测试
    await testAppLoads(browser);
    await testSetupWizardForm(browser);
    await testCourseLibrary(browser);
    await testMaterialLibrary(browser);
    await testCreateCourse(browser);

  } catch (error) {
    console.error('\n❌ 测试执行出错:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }

    // 打印测试总结
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试总结\n');
    console.log(`总测试数: ${testResults.tests.length}`);
    console.log(`✅ 通过: ${testResults.passed}`);
    console.log(`❌ 失败: ${testResults.failed}`);
    console.log(`通过率: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);

    if (testResults.failed > 0) {
      console.log('\n失败的测试:');
      testResults.tests
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`  - ${t.testName}: ${t.message}`);
        });
    }

    console.log('\n' + '='.repeat(60));

    // 退出码：如果有失败的测试则返回 1
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
