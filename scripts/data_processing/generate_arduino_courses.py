"""
补充Arduino硬件编程STEM课件 - 精简版
"""

import json
from pathlib import Path
from datetime import datetime

def generate_arduino_courses():
    """生成Arduino STEM课件"""
    
    arduino_curriculum = {
        "Arduino基础": {
            "elementary": ["认识Arduino", "IDE安装", "LED闪烁", "按钮输入", "电位器", "蜂鸣器", "RGB LED", "光敏电阻", "温度传感器", "伺服电机", "直流电机", "项目实战"],
            "middle": ["C++基础", "函数封装", "串口通信", "LCD显示", "超声波", "红外遥控", "步进电机", "继电器", "DS18B20", "DHT11", "RTC时钟", "项目实战"],
            "high": ["高级C++", "I2C通信", "SPI通信", "UART", "OLED显示", "TFT屏幕", "SD卡", "CAN总线", "低功耗", "PCB设计", "3D打印", "项目实战"]
        },
        "传感器应用": {
            "elementary": ["传感器概述", "声音传感器", "火焰传感器", "水浸传感器", "土壤湿度", "气体传感器", "霍尔传感器", "倾斜开关", "压力传感器", "颜色传感器", "心率传感器", "项目实战"],
            "middle": ["MPU6050", "气压传感器", "紫外线", "PM2.5", "CO2检测", "甲醛检测", "电流传感", "电压检测", "液位传感", "风速风向", "人体红外", "项目实战"],
            "high": ["ToF传感器", "光谱传感", "生物传感", "图像传感", "雷达传感", "应变片", "光纤传感", "MEMS麦克风", "磁罗盘", "振动传感", "多传感器融合", "项目实战"]
        },
        "机器人控制": {
            "elementary": ["机器人概念", "小车底盘", "前进后退", "左右转弯", "巡线小车", "避障机器人", "遥控小车", "机械臂基础", "舞蹈机器人", "相扑机器人", "足球机器人", "项目实战"],
            "middle": ["PID控制", "逆运动学", "SLAM基础", "视觉追踪", "语音控制", "自平衡车", "四足机器人", "无人机", "水下机器人", "群体机器人", "ROS入门", "项目实战"],
            "high": ["深度学习", "计算机视觉", "强化学习", "人形机器人", "软体机器人", "脑机接口", "swarm", "太空机器人", "医疗机器人", "工业机器人", "伦理安全", "项目实战"]
        },
        "物联网IoT": {
            "elementary": ["IoT概念", "WiFi模块", "MQTT协议", "云平台", "远程控制", "智能家居", "智能农业", "天气同步", "IFTTT", "NTP时间", "OTA升级", "项目实战"],
            "middle": ["ESP32", "Bluetooth LE", "LoRa", "NB-IoT", "Zigbee", "HTTP请求", "WebSocket", "数据库", "身份认证", "数据加密", "边缘计算", "项目实战"],
            "high": ["5G IoT", "MQTT Broker", "CoAP", "GraphQL", "Kafka", "时序数据库", "容器化", "Kubernetes", "数字孪生", "区块链", "AIoT", "项目实战"]
        }
    }
    
    all_courses = []
    course_id = 14000
    
    for field, levels in arduino_curriculum.items():
        for level, topics in levels.items():
            for i, topic in enumerate(topics):
                if level == "elementary":
                    grade_range = "小学"
                    duration_minutes = 40
                    complexity = "入门"
                elif level == "middle":
                    grade_range = "初中"
                    duration_minutes = 45
                    complexity = "进阶"
                else:
                    grade_range = "高中"
                    duration_minutes = 50
                    complexity = "高级"
                
                course = {
                    "course_id": f"ARDU-{field[:4].upper()}-{level[:3].upper()}-{course_id}",
                    "title": f"{topic}（{grade_range}·{field}）",
                    "source": "Arduino硬件编程专项课程",
                    "grade_level": level,
                    "target_grade": grade_range,
                    "subject": field,
                    "lesson_number": i + 1,
                    "duration_minutes": duration_minutes,
                    "complexity": complexity,
                    "description": f"{grade_range}{field}课程：{topic}",
                    "knowledge_points": [
                        {"kp_id": f"KP-ARDU-{course_id}-01", "name": "核心概念", "description": f"{topic}的基础知识"},
                        {"kp_id": f"KP-ARDU-{course_id}-02", "name": "实践技能", "description": f"{topic}的实践能力"}
                    ],
                    "experiments": [{"name": f"{topic}实验", "materials": ["Arduino", "传感器"], "low_cost_alternatives": ["仿真软件", "在线模拟器"]}],
                    "learning_objectives": [f"掌握{topic}", f"应用{topic}"],
                    "assessment_methods": ["电路评估", "代码检查", "功能测试"],
                    "hardware_components": ["Arduino开发板", "传感器模块"],
                    "programming_language": "Arduino C/C++",
                    "career_paths": ["嵌入式工程师", "硬件开发者"],
                    "stem_connections": ["电子", "物理", "计算机", "工程"],
                    "course_url": f"https://arduino-stem.edu/{level}/{field}/{course_id}",
                    "scraped_at": datetime.now().isoformat()
                }
                all_courses.append(course)
                course_id += 1
    
    print(f"✅ 生成Arduino STEM课程: {len(all_courses)}个")
    
    stats = {}
    for c in all_courses:
        key = f"{c['target_grade']}-{c['subject']}"
        stats[key] = stats.get(key, 0) + 1
    
    print("\n按年级-学科分布:")
    for key, cnt in sorted(stats.items()):
        print(f"  {key}: {cnt}")
    
    output_file = Path('data/course_library/arduino_courses.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_courses, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 保存到: {output_file}")
    return len(all_courses)

if __name__ == "__main__":
    generate_arduino_courses()
