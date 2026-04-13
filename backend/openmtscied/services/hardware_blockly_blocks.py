"""
OpenMTSciEd 硬件Blockly积木块扩展
定义Arduino/ESP32专用的Blockly积木块和代码生成器
"""

import json
from typing import List, Dict, Any
from pydantic import BaseModel, Field


class BlocklyHardwareBlock(BaseModel):
    """硬件Blockly积木块定义"""

    block_type: str = Field(..., description="积木类型名称")
    category: str = Field(..., description="分类(digital/analog/sensor/motor/communication)")
    xml_definition: str = Field(..., description="Blockly XML定义")
    javascript_generator: str = Field(..., description="JavaScript代码生成器函数")
    arduino_generator: str = Field(..., description="Arduino C++代码生成器函数")
    tooltip: str = Field(default="", description="提示信息")
    help_url: str = Field(default="", description="帮助文档链接")
    required_library: str = Field(default="", description="依赖的Arduino库")


class HardwareBlocklyLibrary:
    """
    硬件Blockly积木块库

    提供Arduino/ESP32专用的积木块定义和代码生成
    """

    def __init__(self):
        self.blocks: List[BlocklyHardwareBlock] = []
        self._initialize_blocks()

    def _initialize_blocks(self):
        """初始化所有硬件积木块"""

        # === 数字I/O积木块 ===
        self.blocks.append(BlocklyHardwareBlock(
            block_type="arduino_digital_write",
            category="digital",
            xml_definition="""<block type="arduino_digital_write">
  <field name="PIN">2</field>
  <value name="VALUE">
    <shadow type="logic_boolean">
      <field name="BOOL">TRUE</field>
    </shadow>
  </value>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['arduino_digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC) || 'HIGH';
  return `digitalWrite(${pin}, ${value});\\n`;
};""",
            arduino_generator="""cpp:
Blockly.Arduino['arduino_digital_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || 'HIGH';

  Blockly.Arduino.setups_['setup_output_' + pin] = 'pinMode(' + pin + ', OUTPUT);';
  return 'digitalWrite(' + pin + ', ' + value + ');\\n';
};""",
            tooltip="设置数字引脚输出(HIGH/LOW)",
            help_url="https://www.arduino.cc/reference/en/language/functions/digital-io/digitalwrite/"
        ))

        self.blocks.append(BlocklyHardwareBlock(
            block_type="arduino_digital_read",
            category="digital",
            xml_definition="""<block type="arduino_digital_read">
  <field name="PIN">2</field>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['arduino_digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  return [`digitalRead(${pin})`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};""",
            arduino_generator="""cpp:
Blockly.Arduino['arduino_digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');

  Blockly.Arduino.setups_['setup_input_' + pin] = 'pinMode(' + pin + ', INPUT);';
  return ['digitalRead(' + pin + ')', Blockly.Arduino.ORDER_FUNCTION_CALL];
};""",
            tooltip="读取数字引脚输入(0或1)",
            help_url="https://www.arduino.cc/reference/en/language/functions/digital-io/digitalread/"
        ))

        # === 模拟I/O积木块 ===
        self.blocks.append(BlocklyHardwareBlock(
            block_type="arduino_analog_write",
            category="analog",
            xml_definition="""<block type="arduino_analog_write">
  <field name="PIN">9</field>
  <value name="VALUE">
    <shadow type="math_number">
      <field name="NUM">128</field>
    </shadow>
  </value>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['arduino_analog_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC) || '0';
  return `analogWrite(${pin}, ${value});\\n`;
};""",
            arduino_generator="""cpp:
Blockly.Arduino['arduino_analog_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var value = Blockly.Arduino.valueToCode(block, 'VALUE', Blockly.Arduino.ORDER_ATOMIC) || '0';

  Blockly.Arduino.setups_['setup_pwm_' + pin] = 'pinMode(' + pin + ', OUTPUT);';
  return 'analogWrite(' + pin + ', ' + value + ');\\n';
};""",
            tooltip="PWM模拟输出(0-255)",
            help_url="https://www.arduino.cc/reference/en/language/functions/analog-io/analogwrite/"
        ))

        self.blocks.append(BlocklyHardwareBlock(
            block_type="arduino_analog_read",
            category="analog",
            xml_definition="""<block type="arduino_analog_read">
  <field name="PIN">A0</field>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['arduino_analog_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  return [`analogRead(${pin})`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};""",
            arduino_generator="""cpp:
Blockly.Arduino['arduino_analog_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  return ['analogRead(' + pin + ')', Blockly.Arduino.ORDER_FUNCTION_CALL];
};""",
            tooltip="读取模拟引脚(0-1023)",
            help_url="https://www.arduino.cc/reference/en/language/functions/analog-io/analogread/"
        ))

        # === 传感器积木块 ===
        self.blocks.append(BlocklyHardwareBlock(
            block_type="sensor_ultrasonic_distance",
            category="sensor",
            xml_definition="""<block type="sensor_ultrasonic_distance">
  <field name="TRIG_PIN">2</field>
  <field name="ECHO_PIN">3</field>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['sensor_ultrasonic_distance'] = function(block) {
  var trigPin = block.getFieldValue('TRIG_PIN');
  var echoPin = block.getFieldValue('ECHO_PIN');
  var code = `
digitalWrite(${trigPin}, LOW);
delayMicroseconds(2);
digitalWrite(${trigPin}, HIGH);
delayMicroseconds(10);
digitalWrite(${trigPin}, LOW);
var duration = pulseIn(${echoPin}, HIGH);
var distance = duration * 0.034 / 2;
`.trim();
  return [code, Blockly.JavaScript.ORDER_NONE];
};""",
            arduino_generator="""cpp:
Blockly.Arduino['sensor_ultrasonic_distance'] = function(block) {
  var trigPin = block.getFieldValue('TRIG_PIN');
  var echoPin = block.getFieldValue('ECHO_PIN');

  Blockly.Arduino.setups_['setup_trig'] = 'pinMode(' + trigPin + ', OUTPUT);';
  Blockly.Arduino.setups_['setup_echo'] = 'pinMode(' + echoPin + ', INPUT);';

  var funcName = 'getDistance_' + trigPin + '_' + echoPin;
  var code = `
float ${funcName}() {
  digitalWrite(${trigPin}, LOW);
  delayMicroseconds(2);
  digitalWrite(${trigPin}, HIGH);
  delayMicroseconds(10);
  digitalWrite(${trigPin}, LOW);

  long duration = pulseIn(${echoPin}, HIGH);
  float distance = duration * 0.034 / 2;
  return distance;
}
`;

  Blockly.Arduino.definitions_[funcName] = code;
  return [funcName + '()', Blockly.Arduino.ORDER_FUNCTION_CALL];
};""",
            tooltip="HC-SR04超声波测距(返回厘米)",
            help_url="",
            required_library=""
        ))

        self.blocks.append(BlocklyHardwareBlock(
            block_type="sensor_dht_temperature",
            category="sensor",
            xml_definition="""<block type="sensor_dht_temperature">
  <field name="PIN">2</field>
  <field name="TYPE">DHT11</field>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['sensor_dht_temperature'] = function(block) {
  var pin = block.getFieldValue('PIN');
  return [`dht.readTemperature(${pin})`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};""",
            arduino_generator="""cpp:
Blockly.Arduino['sensor_dht_temperature'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var dhtType = block.getFieldValue('TYPE');

  Blockly.Arduino.includes_['include_dht'] = '#include <DHT.h>';
  Blockly.Arduino.definitions_['define_dht'] = `DHT dht(${pin}, ${dhtType});`;
  Blockly.Arduino.setups_['setup_dht'] = 'dht.begin();';

  return ['dht.readTemperature()', Blockly.Arduino.ORDER_FUNCTION_CALL];
};""",
            tooltip="DHT11/DHT22温度传感器读数",
            help_url="",
            required_library="DHT sensor library"
        ))

        # === 电机控制积木块 ===
        self.blocks.append(BlocklyHardwareBlock(
            block_type="motor_servo_write",
            category="motor",
            xml_definition="""<block type="motor_servo_write">
  <field name="PIN">9</field>
  <value name="ANGLE">
    <shadow type="math_number">
      <field name="NUM">90</field>
    </shadow>
  </value>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['motor_servo_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var angle = Blockly.JavaScript.valueToCode(block, 'ANGLE', Blockly.JavaScript.ORDER_ATOMIC) || '90';
  return `myservo_${pin}.write(${angle});\\n`;
};""",
            arduino_generator="""cpp:
Blockly.Arduino['motor_servo_write'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var angle = Blockly.Arduino.valueToCode(block, 'ANGLE', Blockly.Arduino.ORDER_ATOMIC) || '90';

  Blockly.Arduino.includes_['include_servo'] = '#include <Servo.h>';
  Blockly.Arduino.definitions_['define_servo_' + pin] = `Servo myservo_${pin};`;
  Blockly.Arduino.setups_['setup_servo_' + pin] = `myservo_${pin}.attach(${pin});`;

  return `myservo_${pin}.write(${angle});\\n`;
};""",
            tooltip="舵机角度控制(0-180度)",
            help_url="",
            required_library="Servo"
        ))

        # === 通信积木块 ===
        self.blocks.append(BlocklyHardwareBlock(
            block_type="comm_serial_print",
            category="communication",
            xml_definition="""<block type="comm_serial_print">
  <value name="MESSAGE">
    <shadow type="text">
      <field name="TEXT">Hello</field>
    </shadow>
  </value>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['comm_serial_print'] = function(block) {
  var message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  return `console.log(${message});\\n`;
};""",
            arduino_generator="""cpp:
Blockly.Arduino['comm_serial_print'] = function(block) {
  var message = Blockly.Arduino.valueToCode(block, 'MESSAGE', Blockly.Arduino.ORDER_ATOMIC) || '""';

  Blockly.Arduino.setups_['setup_serial'] = 'Serial.begin(9600);';
  return 'Serial.println(' + message + ');\\n';
};""",
            tooltip="串口打印消息",
            help_url="https://www.arduino.cc/reference/en/language/functions/communication/serial/println/"
        ))

        self.blocks.append(BlocklyHardwareBlock(
            block_type="comm_wifi_connect",
            category="communication",
            xml_definition="""<block type="comm_wifi_connect">
  <field name="SSID">YourWiFi</field>
  <field name="PASSWORD">YOUR_PASSWORD</field>
</block>""",
            javascript_generator="""javascript:
Blockly.JavaScript['comm_wifi_connect'] = function(block) {
  var ssid = block.getFieldValue('SSID');
  var password = block.getFieldValue('PASSWORD');
  return `// WiFi.connect('${ssid}', '${password}')\\n`;
};""",
            arduino_generator="""cpp:
Blockly.Arduino['comm_wifi_connect'] = function(block) {
  var ssid = block.getFieldValue('SSID');
  var password = block.getFieldValue('PASSWORD');

  Blockly.Arduino.includes_['include_wifi'] = '#include <WiFi.h>';
  Blockly.Arduino.setups_['setup_wifi'] = `
  WiFi.begin("${ssid}", "${password}");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
`;
  return '';
};""",
            tooltip="ESP32连接WiFi网络",
            help_url="",
            required_library="WiFi (ESP32)"
        ))

    def get_block_by_type(self, block_type: str) -> BlocklyHardwareBlock:
        """根据类型获取积木块"""
        for block in self.blocks:
            if block.block_type == block_type:
                return block
        return None

    def get_blocks_by_category(self, category: str) -> List[BlocklyHardwareBlock]:
        """根据分类获取积木块"""
        return [b for b in self.blocks if b.category == category]

    def get_all_blocks(self) -> List[BlocklyHardwareBlock]:
        """获取所有积木块"""
        return self.blocks

    def generate_toolbox_xml(self) -> str:
        """生成Blockly工具箱XML"""

        categories = {
            "digital": "数字I/O",
            "analog": "模拟I/O",
            "sensor": "传感器",
            "motor": "电机控制",
            "communication": "通信"
        }

        xml_parts = ['<xml id="toolbox" style="display: none">']

        for cat_key, cat_name in categories.items():
            blocks = self.get_blocks_by_category(cat_key)
            if blocks:
                xml_parts.append(f'  <category name="{cat_name}" colour="{self._get_category_color(cat_key)}">')
                for block in blocks:
                    xml_parts.append(f'    <block type="{block.block_type}"></block>')
                xml_parts.append('  </category>')

        xml_parts.append('</xml>')
        return '\n'.join(xml_parts)

    def _get_category_color(self, category: str) -> int:
        """获取分类颜色"""
        colors = {
            "digital": 230,      # 蓝色
            "analog": 160,       # 绿色
            "sensor": 60,        # 黄色
            "motor": 0,          # 红色
            "communication": 290 # 紫色
        }
        return colors.get(category, 0)

    def export_to_json(self, filepath: str = "data/blockly_hardware_blocks.json"):
        """导出积木块定义为JSON"""
        from pathlib import Path

        data = [block.model_dump() for block in self.blocks]
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ 已导出 {len(self.blocks)} 个硬件积木块到: {filepath}")


# 示例使用
if __name__ == "__main__":
    library = HardwareBlocklyLibrary()

    print("=" * 60)
    print("硬件Blockly积木块库")
    print("=" * 60)
    print(f"总积木块数: {len(library.get_all_blocks())}")

    categories = ["digital", "analog", "sensor", "motor", "communication"]
    for cat in categories:
        blocks = library.get_blocks_by_category(cat)
        print(f"\n{cat.upper()} ({len(blocks)}个):")
        for block in blocks:
            print(f"  - {block.block_type}: {block.tooltip}")

    print("\n" + "=" * 60)
    print("Blockly工具箱XML预览")
    print("=" * 60)
    print(library.generate_toolbox_xml())

    # 导出到JSON
    library.export_to_json()
