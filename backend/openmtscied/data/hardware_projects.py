"""
OpenMTSciEd 硬件项目库
设计30+个低成本Arduino/ESP32项目(预算≤50元)
"""

import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from pathlib import Path


class Component(BaseModel):
    """硬件组件"""
    name: str = Field(..., description="组件名称")
    quantity: int = Field(default=1, description="数量")
    unit_price: float = Field(..., gt=0, description="单价(元)")
    total_price: float = Field(..., gt=0, description="总价(元)")
    supplier_link: Optional[str] = Field(None, description="购买链接")


class CircuitDiagram(BaseModel):
    """电路图信息"""
    format: str = Field(default="fritzing", description="格式(fritzing/png/svg)")
    file_path: str = Field(..., description="文件路径")
    description: str = Field(default="", description="电路说明")


class CodeExample(BaseModel):
    """代码示例"""
    language: str = Field(default="cpp", description="编程语言")
    code: str = Field(..., description="代码内容")
    description: str = Field(default="", description="代码说明")
    requires_library: List[str] = Field(default_factory=list, description="依赖库")


class HardwareProject(BaseModel):
    """
    硬件项目模型

    低成本Arduino/ESP32项目,预算控制在50元以内
    """

    # 基础信息
    project_id: str = Field(..., description="项目唯一ID")
    title: str = Field(..., description="项目标题")
    category: str = Field(..., description="分类(传感器/电机控制/物联网/智能家居)")
    difficulty: int = Field(..., ge=1, le=5, description="难度等级(1-5)")

    # 关联知识点
    knowledge_point_ids: List[str] = Field(default_factory=list, description="关联的知识点ID列表")
    subject: str = Field(..., description="学科(物理/化学/生物/工程)")

    # 项目描述
    description: str = Field(..., description="项目详细描述")
    learning_objectives: List[str] = Field(default_factory=list, description="学习目标")
    estimated_time_hours: float = Field(..., gt=0, description="预计完成时间(小时)")

    # 硬件清单
    components: List[Component] = Field(default_factory=list, description="所需组件清单")
    total_cost: float = Field(..., gt=0, le=50, description="总成本(元),必须≤50")

    # 技术文档
    circuit_diagram: Optional[CircuitDiagram] = Field(None, description="电路图")
    code_examples: List[CodeExample] = Field(default_factory=list, description="代码示例")
    wiring_instructions: str = Field(default="", description="接线说明")

    # 教学指南
    teaching_guide: str = Field(default="", description="教学指南")
    common_issues: List[str] = Field(default_factory=list, description="常见问题")
    safety_notes: List[str] = Field(default_factory=list, description="安全注意事项")

    # 微控制器类型
    mcu_type: str = Field(default="Arduino Nano", description="微控制器类型(Arduino Nano/ESP32)")

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "project_id": self.project_id,
            "title": self.title,
            "category": self.category,
            "difficulty": self.difficulty,
            "knowledge_point_ids": self.knowledge_point_ids,
            "subject": self.subject,
            "description": self.description,
            "learning_objectives": self.learning_objectives,
            "estimated_time_hours": self.estimated_time_hours,
            "components": [c.model_dump() for c in self.components],
            "total_cost": self.total_cost,
            "mcu_type": self.mcu_type,
            "wiring_instructions": self.wiring_instructions,
        }


class HardwareProjectLibrary:
    """
    硬件项目库

    管理所有硬件项目模板,支持按分类、难度、学科查询
    """

    def __init__(self, data_file: str = "data/hardware_projects.json"):
        self.data_file = Path(data_file)
        self.projects: List[HardwareProject] = []
        self._load_projects()

    def _load_projects(self):
        """加载项目库(从文件或生成示例)"""
        if self.data_file.exists():
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.projects = [HardwareProject(**p) for p in data]
        else:
            # 生成示例项目
            self.projects = self._generate_sample_projects()
            self.save()

    def _generate_sample_projects(self) -> List[HardwareProject]:
        """生成示例硬件项目(覆盖4大分类)"""

        projects = [
            # === 传感器应用类 ===
            HardwareProject(
                project_id="HW-Sensor-001",
                title="超声波测距仪",
                category="传感器",
                difficulty=2,
                knowledge_point_ids=["KP-Phys-001"],
                subject="物理",
                description="使用HC-SR04超声波传感器测量距离,并在串口监视器显示结果",
                learning_objectives=[
                    "理解超声波测距原理",
                    "掌握脉冲宽度测量方法",
                    "学会使用digitalWrite和pulseIn函数"
                ],
                estimated_time_hours=2,
                components=[
                    Component(name="Arduino Nano", quantity=1, unit_price=15, total_price=15),
                    Component(name="HC-SR04超声波模块", quantity=1, unit_price=5, total_price=5),
                    Component(name="杜邦线", quantity=4, unit_price=0.5, total_price=2),
                ],
                total_cost=22,
                mcu_type="Arduino Nano",
                wiring_instructions="VCC→5V, GND→GND, Trig→D2, Echo→D3",
                code_examples=[
                    CodeExample(
                        language="cpp",
                        code="""const int trigPin = 2;
const int echoPin = 3;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  // 发送10us脉冲
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // 测量脉冲宽度
  long duration = pulseIn(echoPin, HIGH);

  // 计算距离(cm)
  float distance = duration * 0.034 / 2;

  Serial.print("距离: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(500);
}""",
                        description="基础测距代码",
                        requires_library=[]
                    )
                ],
                teaching_guide="先讲解超声波原理,再演示接线,最后编写代码",
                common_issues=[
                    "接线错误导致无响应",
                    "距离测量不稳定(需加滤波)"
                ],
                safety_notes=["避免近距离对着人眼"]
            ),

            # === 电机控制类 ===
            HardwareProject(
                project_id="HW-Motor-001",
                title="智能风扇控制系统",
                category="电机控制",
                difficulty=3,
                knowledge_point_ids=["KP-Phys-002", "KP-Eng-001"],
                subject="工程",
                description="使用温度传感器和直流电机制作智能风扇,温度超过阈值自动启动",
                learning_objectives=[
                    "理解PWM调速原理",
                    "掌握温度传感器读取",
                    "学会条件控制逻辑"
                ],
                estimated_time_hours=3,
                components=[
                    Component(name="Arduino Nano", quantity=1, unit_price=15, total_price=15),
                    Component(name="DHT11温湿度传感器", quantity=1, unit_price=4, total_price=4),
                    Component(name="直流电机", quantity=1, unit_price=8, total_price=8),
                    Component(name="L298N电机驱动模块", quantity=1, unit_price=6, total_price=6),
                    Component(name="杜邦线", quantity=10, unit_price=0.5, total_price=5),
                ],
                total_cost=38,
                mcu_type="Arduino Nano",
                wiring_instructions="DHT11 DATA→D2, 电机IN1→D3, IN2→D4, ENA→D5(PWM)",
                code_examples=[
                    CodeExample(
                        language="cpp",
                        code="""#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11
#define MOTOR_PIN 5

DHT dht(DHTPIN, DHTTYPE);
const float TEMP_THRESHOLD = 28.0;

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(MOTOR_PIN, OUTPUT);
}

void loop() {
  float temperature = dht.readTemperature();

  if (isnan(temperature)) {
    Serial.println("读取失败!");
    return;
  }

  Serial.print("温度: ");
  Serial.print(temperature);
  Serial.println(" °C");

  if (temperature > TEMP_THRESHOLD) {
    // 温度越高,转速越快
    int speed = map(temperature, TEMP_THRESHOLD, 35, 100, 255);
    analogWrite(MOTOR_PIN, speed);
    Serial.print("风扇启动,转速: ");
    Serial.println(speed);
  } else {
    analogWrite(MOTOR_PIN, 0);
    Serial.println("风扇停止");
  }

  delay(2000);
}""",
                        description="智能温控风扇代码",
                        requires_library=["DHT sensor library"]
                    )
                ],
                teaching_guide="讲解PWM原理 → 温度传感器使用 → 综合控制逻辑",
                common_issues=[
                    "电机驱动模块供电不足",
                    "温度读数波动大"
                ],
                safety_notes=["注意电机转动时勿触碰扇叶"]
            ),

            # === 物联网类 ===
            HardwareProject(
                project_id="HW-IoT-001",
                title="WiFi环境监测站",
                category="物联网",
                difficulty=4,
                knowledge_point_ids=["KP-Phys-003", "KP-Eng-002"],
                subject="工程",
                description="使用ESP32连接WiFi,实时上传温湿度数据到云平台",
                learning_objectives=[
                    "理解WiFi通信原理",
                    "掌握HTTP POST请求",
                    "学会使用JSON格式传输数据"
                ],
                estimated_time_hours=4,
                components=[
                    Component(name="ESP32开发板", quantity=1, unit_price=20, total_price=20),
                    Component(name="DHT22温湿度传感器", quantity=1, unit_price=8, total_price=8),
                    Component(name="面包板", quantity=1, unit_price=5, total_price=5),
                    Component(name="杜邦线", quantity=6, unit_price=0.5, total_price=3),
                ],
                total_cost=36,
                mcu_type="ESP32",
                wiring_instructions="DHT22 DATA→GPIO4, VCC→3.3V, GND→GND",
                code_examples=[
                    CodeExample(
                        language="cpp",
                        code="""#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* server_url = "http://your-server.com/api/data";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi已连接");
}

void loop() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temp) || isnan(humidity)) {
    Serial.println("读取失败");
    return;
  }

  // 构建JSON数据
  String json = "{\"temperature\":" + String(temp) +
                ",\"humidity\":" + String(humidity) + "}";

  // 发送HTTP POST
  HTTPClient http;
  http.begin(server_url);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(json);

  Serial.print("HTTP响应码: ");
  Serial.println(httpResponseCode);

  http.end();
  delay(60000); // 每分钟上传一次
}""",
                        description="WiFi数据上传代码",
                        requires_library=["WiFi", "HTTPClient", "DHT sensor library"]
                    )
                ],
                teaching_guide="WiFi配置 → HTTP协议讲解 → JSON数据格式 → 云平台对接",
                common_issues=[
                    "WiFi连接失败(检查SSID和密码)",
                    "HTTP请求超时(检查服务器地址)"
                ],
                safety_notes=["ESP32使用3.3V逻辑电平,勿接5V"]
            ),

            # === 智能家居类 ===
            HardwareProject(
                project_id="HW-SmartHome-001",
                title="语音控制LED灯",
                category="智能家居",
                difficulty=3,
                knowledge_point_ids=["KP-Eng-003"],
                subject="工程",
                description="使用蓝牙模块实现手机APP语音控制LED灯开关和亮度",
                learning_objectives=[
                    "理解蓝牙串口通信",
                    "掌握语音识别基本原理",
                    "学会PWM调光技术"
                ],
                estimated_time_hours=3,
                components=[
                    Component(name="Arduino Nano", quantity=1, unit_price=15, total_price=15),
                    Component(name="HC-05蓝牙模块", quantity=1, unit_price=10, total_price=10),
                    Component(name="LED灯珠", quantity=3, unit_price=1, total_price=3),
                    Component(name="220Ω电阻", quantity=3, unit_price=0.2, total_price=0.6),
                    Component(name="杜邦线", quantity=8, unit_price=0.5, total_price=4),
                ],
                total_cost=32.6,
                mcu_type="Arduino Nano",
                wiring_instructions="HC-05 TX→D2, RX→D3, LED→D9(PWM)",
                code_examples=[
                    CodeExample(
                        language="cpp",
                        code="""#include <SoftwareSerial.h>

SoftwareSerial bluetooth(2, 3); // RX, TX
const int ledPin = 9;

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (bluetooth.available()) {
    String command = bluetooth.readStringUntil('\\n');
    command.trim();

    if (command == "开灯") {
      digitalWrite(ledPin, HIGH);
      bluetooth.println("灯已打开");
    }
    else if (command == "关灯") {
      digitalWrite(ledPin, LOW);
      bluetooth.println("灯已关闭");
    }
    else if (command.startsWith("亮度")) {
      int brightness = command.substring(2).toInt();
      analogWrite(ledPin, brightness);
      bluetooth.print("亮度设置为: ");
      bluetooth.println(brightness);
    }
  }
}""",
                        description="蓝牙语音控制代码",
                        requires_library=["SoftwareSerial"]
                    )
                ],
                teaching_guide="蓝牙配对 → 串口通信 → 语音指令解析 → PWM调光",
                common_issues=[
                    "蓝牙配对失败(检查波特率)",
                    "中文乱码(需统一编码)"
                ],
                safety_notes=["LED需串联限流电阻"]
            ),
        ]

        return projects

    def get_project_by_id(self, project_id: str) -> Optional[HardwareProject]:
        """根据ID获取项目"""
        for project in self.projects:
            if project.project_id == project_id:
                return project
        return None

    def get_projects_by_category(self, category: str) -> List[HardwareProject]:
        """根据分类获取项目"""
        return [p for p in self.projects if p.category == category]

    def get_projects_by_difficulty(self, difficulty: int) -> List[HardwareProject]:
        """根据难度获取项目"""
        return [p for p in self.projects if p.difficulty == difficulty]

    def get_projects_by_subject(self, subject: str) -> List[HardwareProject]:
        """根据学科获取项目"""
        return [p for p in self.projects if p.subject == subject]

    def get_projects_by_knowledge_point(self, kp_id: str) -> List[HardwareProject]:
        """根据知识点ID获取相关项目"""
        return [p for p in self.projects if kp_id in p.knowledge_point_ids]

    def search_projects(self, keyword: str) -> List[HardwareProject]:
        """搜索项目"""
        keyword_lower = keyword.lower()
        return [
            p for p in self.projects
            if keyword_lower in p.title.lower() or keyword_lower in p.description.lower()
        ]

    def save(self):
        """保存项目库到JSON文件"""
        self.data_file.parent.mkdir(parents=True, exist_ok=True)

        data = [p.to_dict() for p in self.projects]
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ 已保存 {len(self.projects)} 个硬件项目到: {self.data_file}")

    def get_statistics(self) -> Dict[str, Any]:
        """获取项目库统计信息"""
        category_count = {}
        difficulty_count = {}
        subject_count = {}
        cost_stats = {"min": float('inf'), "max": 0, "avg": 0}

        total_cost = 0
        for project in self.projects:
            category_count[project.category] = category_count.get(project.category, 0) + 1
            difficulty_count[project.difficulty] = difficulty_count.get(project.difficulty, 0) + 1
            subject_count[project.subject] = subject_count.get(project.subject, 0) + 1

            cost_stats["min"] = min(cost_stats["min"], project.total_cost)
            cost_stats["max"] = max(cost_stats["max"], project.total_cost)
            total_cost += project.total_cost

        cost_stats["avg"] = total_cost / len(self.projects) if self.projects else 0

        return {
            "total_projects": len(self.projects),
            "by_category": category_count,
            "by_difficulty": difficulty_count,
            "by_subject": subject_count,
            "cost_statistics": cost_stats,
            "all_under_50": all(p.total_cost <= 50 for p in self.projects),
        }


# 示例使用
if __name__ == "__main__":
    library = HardwareProjectLibrary()

    print("=" * 60)
    print("硬件项目库统计")
    print("=" * 60)

    stats = library.get_statistics()
    print(f"总项目数: {stats['total_projects']}")
    print(f"按分类分布: {stats['by_category']}")
    print(f"按难度分布: {stats['by_difficulty']}")
    print(f"按学科分布: {stats['by_subject']}")
    print(f"成本统计: 最低{stats['cost_statistics']['min']}元, 最高{stats['cost_statistics']['max']}元, 平均{stats['cost_statistics']['avg']:.1f}元")
    print(f"所有项目预算≤50元: {'是' if stats['all_under_50'] else '否'}")

    print("\n" + "=" * 60)
    print("项目列表示例")
    print("=" * 60)

    for i, project in enumerate(library.projects, 1):
        print(f"\n{i}. [{project.category}] {project.title}")
        print(f"   难度: {'★' * project.difficulty}{'☆' * (5-project.difficulty)}")
        print(f"   成本: {project.total_cost}元")
        print(f"   MCU: {project.mcu_type}")
        print(f"   预计时长: {project.estimated_time_hours}小时")
