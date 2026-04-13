# Blockly 集成说明

## 📦 安装依赖

在 `desktop-manager` 目录下运行以下命令安装 Blockly：

```bash
npm install blockly
```

或者使用 yarn：

```bash
yarn add blockly
```

## 🔧 配置步骤

### 1. 更新 package.json

确保 `package.json` 中包含以下依赖：

```json
{
  "dependencies": {
    "blockly": "^10.0.0"
  }
}
```

### 2. 在 Angular 组件中导入 Blockly

在需要使用 Blockly 的组件中，添加以下导入：

```typescript
import * as Blockly from 'blockly';
import 'blockly/blocks';
import 'blockly/javascript';
import 'blockly/python';
```

### 3. 创建自定义积木块（可选）

如果需要 Arduino 特定的积木块，创建文件 `src/app/features/hardware-projects/blockly-editor/arduino-blocks.ts`：

```typescript
import * as Blockly from 'blockly';

// 定义数字写入积木块
Blockly.Blocks['arduino_digital_write'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("数字写入 引脚")
        .appendField(new Blockly.FieldDropdown([
          ["2","2"], ["3","3"], ["4","4"], ["5","5"],
          ["6","6"], ["7","7"], ["8","8"], ["9","9"],
          ["10","10"], ["11","11"], ["12","12"], ["13","13"]
        ]), "PIN")
        .appendField("值")
        .appendField(new Blockly.FieldDropdown([
          ["HIGH","HIGH"], ["LOW","LOW"]
        ]), "VALUE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("向指定引脚写入数字信号");
    this.setHelpUrl("");
  }
};

// 生成 Arduino C++ 代码
Blockly.Arduino['arduino_digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var value = block.getFieldValue('VALUE');
  var code = `digitalWrite(${pin}, ${value});\n`;
  return code;
};

// 类似地定义其他积木块...
```

### 4. 在组件中注册自定义积木块

在 `blockly-editor.component.ts` 的 `ngAfterViewInit` 方法中：

```typescript
ngAfterViewInit(): void {
  // 注册自定义积木块
  if (typeof Blockly !== 'undefined') {
    // 导入自定义积木块定义
    // import './arduino-blocks';
    
    this.initializeBlockly();
  }
}
```

## 🎨 自定义积木块示例

### 传感器积木块

```typescript
// DHT11 温湿度传感器读取
Blockly.Blocks['sensor_dht11_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("DHT11 读取")
        .appendField(new Blockly.FieldDropdown([
          ["温度","TEMPERATURE"], 
          ["湿度","HUMIDITY"]
        ]), "TYPE");
    this.setOutput(true, "Number");
    this.setColour(230);
    this.setTooltip("读取DHT11传感器的温度或湿度");
  }
};

Blockly.Arduino['sensor_dht11_read'] = function(block) {
  var type = block.getFieldValue('TYPE');
  var code = type === 'TEMPERATURE' 
    ? 'dht.readTemperature()' 
    : 'dht.readHumidity()';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
```

### 延时积木块

```typescript
Blockly.Blocks['arduino_delay'] = {
  init: function() {
    this.appendValueInput("MS")
        .setCheck("Number")
        .appendField("延时");
    this.appendDummyInput()
        .appendField("毫秒");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("程序延时指定的毫秒数");
  }
};

Blockly.Arduino['arduino_delay'] = function(block) {
  var ms = Blockly.Arduino.valueToCode(block, 'MS', Blockly.Arduino.ORDER_ATOMIC) || '1000';
  return `delay(${ms});\n`;
};
```

## 🚀 使用示例

### 基本用法

```typescript
// 创建工作区
const workspace = Blockly.inject(element, {
  toolbox: document.getElementById('toolbox'),
  grid: {
    spacing: 20,
    length: 3,
    colour: '#ccc',
    snap: true
  },
  zoom: {
    controls: true,
    wheel: true
  }
});

// 加载 XML
const xml = Blockly.utils.xml.textToDom(xmlString);
Blockly.Xml.domToWorkspace(xml, workspace);

// 生成代码
const code = Blockly.Arduino.workspaceToCode(workspace);
```

### 保存和加载

```typescript
// 保存为 XML
const xml = Blockly.Xml.workspaceToDom(workspace);
const xmlText = Blockly.Xml.domToText(xml);
localStorage.setItem('project', xmlText);

// 从 XML 加载
const savedXml = localStorage.getItem('project');
if (savedXml) {
  const xml = Blockly.utils.xml.textToDom(savedXml);
  Blockly.Xml.domToWorkspace(xml, workspace);
}
```

## 📝 注意事项

1. **TypeScript 类型声明**：Blockly 提供了完整的 TypeScript 类型定义，无需额外配置。

2. **样式定制**：可以通过 CSS 自定义 Blockly 编辑器的外观：
   ```css
   .blocklyToolboxDiv {
     background-color: #f8f9fa !important;
   }
   ```

3. **性能优化**：对于大型项目，建议启用工作区序列化：
   ```typescript
   const state = Blockly.serialization.workspaces.save(workspace);
   Blockly.serialization.workspaces.load(state, workspace);
   ```

4. **多语言支持**：Blockly 支持多种语言切换：
   ```typescript
   Blockly.setLocale('zh-hans'); // 简体中文
   ```

## 🔗 相关资源

- [Blockly 官方文档](https://developers.google.com/blockly)
- [Blockly GitHub](https://github.com/google/blockly)
- [Arduino 积木块示例](https://github.com/gasolin/BlocklyDuino)
- [自定义积木块教程](https://developers.google.com/blockly/guides/create-custom-blocks/overview)

## 🐛 常见问题

### Q: Blockly 未定义错误
**A**: 确保已正确安装 blockly 依赖，并在组件中导入：
```typescript
import * as Blockly from 'blockly';
```

### Q: 自定义积木块不显示
**A**: 检查是否在工具箱 XML 中添加了相应的分类和积木块定义。

### Q: 代码生成失败
**A**: 确保已导入对应的代码生成器（如 `blockly/javascript`、`blockly/python`）。

### Q: 中文显示乱码
**A**: 设置正确的语言环境：
```typescript
Blockly.setLocale('zh-hans');
```

## ✅ 验收清单

- [x] T2.3.1: 创建硬件项目数据模型 (`hardware-project.models.ts`)
- [x] T2.3.2: 实现硬件项目列表组件 (`hardware-project-list.component.ts`)
- [x] T2.3.3: 集成 Blockly 可视化编程编辑器 (`blockly-editor.component.ts`)

待完成：
- [ ] 安装 Blockly 依赖 (`npm install blockly`)
- [ ] 创建自定义 Arduino 积木块
- [ ] 实现 WebUSB 烧录功能
- [ ] 测试代码生成功能
- [ ] 编写用户操作指南
