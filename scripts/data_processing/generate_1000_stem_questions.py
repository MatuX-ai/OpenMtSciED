#!/usr/bin/env python3
"""
批量生成1000道STEM教育题目并导入Neo4j
涵盖：Arduino、机器人、编程、电子电路、3D打印、物联网、AI、工程设计等
基于现有课程和硬件项目数据生成多样化题目
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
import neo4j
import random

# Neo4j配置
NEO4J_URI = "neo4j+s://4abd5ef9.databases.neo4j.io"
NEO4J_USER = "4abd5ef9"
NEO4J_PASSWORD = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

def load_hardware_projects():
    """加载硬件项目数据"""
    try:
        with open('data/hardware_projects.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

def load_courses():
    """加载STEM课程数据"""
    courses = []
    course_files = [
        'data/course_library/arduino_courses.json',
        'data/course_library/game_development_courses.json',
        'data/course_library/programming_stem_courses.json',
        'data/course_library/ros_courses.json'
    ]
    
    for file_path in course_files:
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        courses.extend(data)
        except:
            pass
    
    return courses

def generate_arduino_questions(count=150):
    """生成Arduino相关题目"""
    topics = [
        ("数字引脚", ["digitalWrite", "pinMode", "INPUT", "OUTPUT", "HIGH", "LOW"]),
        ("模拟引脚", ["analogRead", "analogWrite", "PWM", "分辨率", "0-1023"]),
        ("串口通信", ["Serial.begin", "Serial.print", "波特率", "9600", "调试"]),
        ("传感器", ["超声波", "红外", "温湿度", "光敏", "声音", "触摸"]),
        ("执行器", ["LED", "电机", "舵机", "蜂鸣器", "继电器", "显示屏"]),
        ("编程结构", ["setup", "loop", "变量", "函数", "数组", "条件判断", "循环"]),
        ("通信协议", ["I2C", "SPI", "UART", "Wire库", "地址", "主从模式"]),
        ("电源管理", ["电压", "电流", "电池", "稳压", "功耗", "睡眠模式"]),
        ("中断", ["attachInterrupt", "ISR", "上升沿", "下降沿", "CHANGE"]),
        ("定时器", ["millis", "micros", "delay", "非阻塞", "计时器"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.2, 0.8), 1)
        
        question_templates = [
            f"Arduino中{topic}相关的{keywords[0]}函数的作用是什么？",
            f"如何使用Arduino实现{topic}功能？请说明关键步骤。",
            f"Arduino的{topic}模块需要注意哪些常见问题？",
            f"解释Arduino中{keywords[0]}和{keywords[1]}的区别。",
            f"在Arduino项目中，{topic}的典型应用场景有哪些？",
            f"Arduino {topic}的代码示例中，{keywords[0]}参数的含义是什么？",
            f"如何调试Arduino的{topic}相关问题？",
            f"Arduino {topic}功能的最佳实践是什么？",
            f"解释Arduino中{topic}的工作原理。",
            f"Arduino {topic}与其他开发板相比有什么特点？"
        ]
        
        answer_templates = [
            f"{keywords[0]}用于{topic}的核心功能，需要配合{keywords[1]}使用",
            f"首先初始化{keywords[0]}，然后在loop中调用{keywords[1]}实现{topic}",
            f"注意{keywords[0]}的接线方式，避免{keywords[1]}导致的短路问题",
            f"{keywords[0]}是{keywords[1]}的基础，两者配合实现完整的{topic}功能",
            f"常用于智能小车、环境监测、互动装置等{topic}应用",
            f"{keywords[0]}控制{topic}的参数，{keywords[1]}决定工作模式",
            f"使用Serial.print输出调试信息，检查{keywords[0]}返回值",
            f"模块化设计，封装{keywords[0]}函数，添加异常处理",
            f"通过{keywords[0]}读取/写入数据，{keywords[1]}处理信号",
            f"Arduino Uno适合入门，Mega提供更多引脚，Nano更小巧"
        ]
        
        kp_templates = [
            ["Arduino基础", topic, keywords[0]],
            ["硬件编程", topic, "引脚配置"],
            ["嵌入式系统", topic, keywords[1]],
            ["传感器应用", topic, "数据采集"],
            ["控制算法", topic, "实时控制"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "arduino",
            "source": "stem_education_extended"
        })
    
    return questions

def generate_robotics_questions(count=150):
    """生成机器人技术题目"""
    topics = [
        ("运动控制", ["差速驱动", "PID控制", "编码器", "速度闭环", "轨迹跟踪"]),
        ("传感器融合", ["超声波", "红外", "陀螺仪", "加速度计", "磁力计"]),
        ("视觉识别", ["OpenCV", "颜色识别", "形状检测", "二维码", "人脸检测"]),
        ("路径规划", ["A*算法", "Dijkstra", "RRT", "避障", "最短路径"]),
        ("机械结构", ["齿轮传动", "连杆机构", "舵机控制", "抓取机构", "底盘设计"]),
        ("控制系统", ["反馈控制", "状态机", "行为树", "决策逻辑", "容错机制"]),
        ("通信技术", ["蓝牙", "WiFi", "Zigbee", "MQTT", "ROS消息"]),
        ("导航定位", ["SLAM", "里程计", "GPS", "地图构建", "位置估计"]),
        ("人工智能", ["机器学习", "神经网络", "强化学习", "目标检测", "语音识别"]),
        ("项目管理", ["需求分析", "系统设计", "测试验证", "文档编写", "团队协作"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.3, 0.9), 1)
        
        question_templates = [
            f"机器人{topic}中{keywords[0]}技术的核心原理是什么？",
            f"如何实现机器人的{topic}功能？列出关键技术点。",
            f"机器人{topic}系统常见的故障有哪些？如何排查？",
            f"比较{keywords[0]}和{keywords[1]}在机器人{topic}中的优劣。",
            f"机器人{topic}在实际应用中的挑战是什么？",
            f"解释机器人{topic}中{keywords[0]}算法的工作流程。",
            f"如何优化机器人{topic}的性能？",
            f"机器人{topic}系统的架构设计要点是什么？",
            f"描述机器人{topic}从感知到执行的完整流程。",
            f"机器人{topic}技术在教育领域的应用案例有哪些？"
        ]
        
        answer_templates = [
            f"{keywords[0]}通过{keywords[1]}实现精确的{topic}控制",
            f"结合{keywords[0]}传感器和{keywords[1]}算法，建立{topic}模型",
            f"检查{keywords[0]}连接，校准{keywords[1]}参数，验证{topic}逻辑",
            f"{keywords[0]}精度高但成本高，{keywords[1]}成本低但精度一般",
            f"环境不确定性、传感器噪声、计算资源限制等{topic}挑战",
            f"采集数据→特征提取→{keywords[0]}处理→{keywords[1]}决策→执行",
            f"优化{keywords[0]}算法复杂度，减少{keywords[1]}延迟，提高{topic}效率",
            f"分层架构：感知层、决策层、执行层，模块化{topic}设计",
            f"传感器采集→数据处理→{keywords[0]}规划→{keywords[1]}控制→动作执行",
            f"编程教育、竞赛培训、创客空间、STEM课程等{topic}场景"
        ]
        
        kp_templates = [
            ["机器人学", topic, keywords[0]],
            ["自动控制", topic, keywords[1]],
            ["人工智能", topic, "智能决策"],
            ["机械工程", topic, "结构设计"],
            ["计算机视觉", topic, "图像识别"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "robotics",
            "source": "stem_education_extended"
        })
    
    return questions

def generate_programming_questions(count=150):
    """生成编程与计算思维题目"""
    topics = [
        ("基础语法", ["变量", "数据类型", "运算符", "表达式", "注释"]),
        ("控制结构", ["if-else", "switch", "for循环", "while循环", "break", "continue"]),
        ("函数", ["参数传递", "返回值", "递归", "匿名函数", "闭包"]),
        ("数据结构", ["数组", "列表", "字典", "集合", "栈", "队列", "树", "图"]),
        ("面向对象", ["类", "对象", "继承", "多态", "封装", "接口"]),
        ("算法", ["排序", "搜索", "动态规划", "贪心算法", "分治法"]),
        ("调试技巧", ["断点", "日志", "单元测试", "性能分析", "内存泄漏"]),
        ("版本控制", ["Git", "分支", "合并", "冲突解决", "提交规范"]),
        ("Web开发", ["HTML", "CSS", "JavaScript", "DOM", "API", "框架"]),
        ("软件工程", ["设计模式", "重构", "代码规范", "文档", "敏捷开发"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.2, 0.8), 1)
        
        question_templates = [
            f"编程中{topic}的{keywords[0]}概念是什么？",
            f"如何使用{keywords[0]}实现{topic}功能？给出代码示例。",
            f"{keywords[0]}和{keywords[1]}在{topic}中有什么区别？",
            f"解释{topic}中{keywords[0]}的最佳实践。",
            f"{topic}常见的{keywords[0]}错误有哪些？如何避免？",
            f"描述{topic}中{keywords[0]}的工作原理。",
            f"如何优化{topic}中的{keywords[0]}性能？",
            f"{topic}在实际项目中{keywords[0]}的应用场景是什么？",
            f"比较不同编程语言中{topic}的{keywords[0]}实现。",
            f"{topic}学习中掌握{keywords[0]}的重要性是什么？"
        ]
        
        answer_templates = [
            f"{keywords[0]}是{topic}的基础，用于存储和操作数据",
            f"定义{keywords[0]}变量，使用{keywords[1]}进行处理，返回结果",
            f"{keywords[0]}适用于简单场景，{keywords[1]}适合复杂逻辑",
            f"命名规范、注释清晰、单一职责、避免副作用",
            f"空指针、越界访问、类型错误，通过静态检查和测试避免",
            f"编译时确定类型，运行时分配内存，垃圾回收管理生命周期",
            f"减少嵌套层级，使用合适的数据结构，缓存中间结果",
            f"数据处理、用户交互、业务逻辑、系统集成等场景",
            f"Python简洁易读，Java严谨规范，C++高效灵活",
            f"培养逻辑思维、问题解决能力、抽象思维能力"
        ]
        
        kp_templates = [
            ["编程基础", topic, keywords[0]],
            ["计算思维", topic, "算法设计"],
            ["软件工程", topic, keywords[1]],
            ["数据结构", topic, "数据存储"],
            ["算法分析", topic, "复杂度"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "programming",
            "source": "stem_education_extended"
        })
    
    return questions

def generate_electronics_questions(count=120):
    """生成电子电路题目"""
    topics = [
        ("基本元件", ["电阻", "电容", "电感", "二极管", "三极管", "MOSFET"]),
        ("电路分析", ["欧姆定律", "基尔霍夫定律", "戴维南定理", "诺顿定理"]),
        ("模拟电路", ["放大器", "滤波器", "振荡器", "稳压器", "比较器"]),
        ("数字电路", ["逻辑门", "触发器", "计数器", "译码器", "存储器"]),
        ("电源电路", ["整流", "滤波", "稳压", "DC-DC转换", "LDO"]),
        ("信号处理", ["ADC", "DAC", "采样定理", "滤波", "调制解调"]),
        ("PCB设计", ["布局", "布线", "接地", "去耦", "阻抗匹配"]),
        ("测量仪器", ["万用表", "示波器", "信号发生器", "频谱仪", "逻辑分析仪"]),
        ("电磁兼容", ["干扰", "屏蔽", "滤波", "接地", "隔离"]),
        ("安全规范", ["绝缘", "漏电流", "过压保护", "过流保护", "防静电"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.3, 0.8), 1)
        
        question_templates = [
            f"电子电路中{topic}的{keywords[0]}有什么作用？",
            f"如何选择适合的{keywords[0]}用于{topic}电路？",
            f"解释{topic}中{keywords[0]}和{keywords[1]}的配合使用。",
            f"{topic}电路设计中{keywords[0]}的注意事项有哪些？",
            f"如何测试{topic}电路中{keywords[0]}的性能？",
            f"描述{topic}中{keywords[0]}的工作原理。",
            f"{topic}常见故障中{keywords[0]}问题的排查方法是什么？",
            f"比较不同类型{keywords[0]}在{topic}中的应用。",
            f"{topic}电路优化时如何改进{keywords[0]}参数？",
            f"{topic}在实际应用中{keywords[0]}的选型标准是什么？"
        ]
        
        answer_templates = [
            f"{keywords[0]}用于{topic}的信号调理或能量转换",
            f"根据电压、电流、功率、频率等参数选择{keywords[0]}",
            f"{keywords[0]}提供基础功能，{keywords[1]}增强性能或稳定性",
            f"注意散热、耐压、封装尺寸、成本等因素",
            f"使用{keywords[0]}测量关键节点，对比理论值与实际值",
            f"基于半导体物理或电磁理论，{keywords[0]}实现特定功能",
            f"检查{keywords[0]}是否损坏，测量{keywords[1]}参数，替换验证",
            f"插件式成本低，贴片式体积小，混合式兼顾性能和成本",
            f"降低噪声、提高效率、减小体积、降低成本",
            f"可靠性、性价比、供货周期、技术支持、环保要求"
        ]
        
        kp_templates = [
            ["电子技术", topic, keywords[0]],
            ["电路设计", topic, keywords[1]],
            ["硬件工程", topic, "系统集成"],
            ["信号处理", topic, "数据采集"],
            ["电磁学", topic, "场与波"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "electronics",
            "source": "stem_education_extended"
        })
    
    return questions

def generate_3d_printing_questions(count=100):
    """生成3D打印题目"""
    topics = [
        ("打印技术", ["FDM", "SLA", "SLS", "DLP", "多材料打印"]),
        ("材料科学", ["PLA", "ABS", "PETG", "TPU", "尼龙", "树脂"]),
        ("建模软件", ["Tinkercad", "Fusion 360", "Blender", "SolidWorks", "OpenSCAD"]),
        ("切片设置", ["层高", "填充率", "支撑", "温度", "速度", "回抽"]),
        ("后处理", ["打磨", "抛光", "喷漆", "组装", "加固"]),
        ("设计原则", ["壁厚", "悬垂角度", "公差配合", "轻量化", "模块化"]),
        ("故障排除", ["翘边", "堵头", "层纹", "错位", "拉丝"]),
        ("应用领域", ["原型制作", "教育模型", "医疗器械", "航空航天", "艺术品"]),
        ("成本控制", ["材料用量", "打印时间", "失败率", "设备维护", "能耗"]),
        ("可持续发展", ["可回收材料", "节能减排", "循环经济", "绿色制造"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.2, 0.7), 1)
        
        question_templates = [
            f"3D打印中{topic}的{keywords[0]}技术特点是什么？",
            f"如何选择{keywords[0]}材料用于{topic}项目？",
            f"解释{topic}中{keywords[0]}和{keywords[1]}的关系。",
            f"{topic}过程中{keywords[0]}参数的调整方法是什么？",
            f"如何解决{topic}中{keywords[0]}导致的打印问题？",
            f"描述{topic}中{keywords[0]}的工作流程。",
            f"{topic}设计时{keywords[0]}的优化策略有哪些？",
            f"比较{keywords[0]}和其他{topic}技术的优劣。",
            f"{topic}在教育中{keywords[0]}的应用价值是什么？",
            f"{topic}未来发展趋势中{keywords[0]}的方向是什么？"
        ]
        
        answer_templates = [
            f"{keywords[0]}适合快速原型，成本低但精度一般",
            f"考虑强度、韧性、耐温性、表面质量等{keywords[0]}特性",
            f"{keywords[0]}决定外观，{keywords[1]}影响内部结构",
            f"根据模型复杂度调整{keywords[0]}，平衡质量和时间",
            f"调整{keywords[0]}温度，优化{keywords[1]}设置，清洁喷嘴",
            f"建模→导出STL→切片→生成G代码→打印→后处理",
            f"减少支撑、优化方向、 hollow设计、拓扑优化",
            f"FDM普及度高，SLA精度高，SLS强度高但成本高",
            f"培养空间思维、动手能力、创新设计、工程素养",
            f"多材料、高速化、智能化、大型化、生物打印"
        ]
        
        kp_templates = [
            ["增材制造", topic, keywords[0]],
            ["材料工程", topic, keywords[1]],
            ["CAD/CAM", topic, "数字化制造"],
            ["产品设计", topic, "快速原型"],
            ["智能制造", topic, "工业4.0"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "3d_printing",
            "source": "stem_education_extended"
        })
    
    return questions

def generate_iot_questions(count=100):
    """生成物联网题目"""
    topics = [
        ("硬件平台", ["ESP8266", "ESP32", "Arduino", "Raspberry Pi", "STM32"]),
        ("通信协议", ["MQTT", "HTTP", "CoAP", "WebSocket", "LoRa", "NB-IoT"]),
        ("传感器", ["温湿度", "光照", "气体", "运动", "压力", "声音"]),
        ("云平台", ["阿里云", "腾讯云", "AWS IoT", "Azure IoT", "ThingsBoard"]),
        ("数据处理", ["边缘计算", "数据过滤", "聚合统计", "异常检测", "可视化"]),
        ("安全技术", ["加密", "认证", "授权", "防火墙", "VPN", "证书"]),
        ("应用场景", ["智能家居", "智慧农业", "工业监控", "健康监测", "环境监测"]),
        ("能源管理", ["低功耗", "太阳能", "电池优化", "能量收集", "睡眠模式"]),
        ("系统集成", ["API集成", "微服务", "消息队列", "数据库", "前端展示"]),
        ("标准规范", ["IEEE 802.15.4", "Zigbee", "Bluetooth LE", "WiFi 6", "5G"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.3, 0.8), 1)
        
        question_templates = [
            f"物联网{topic}中{keywords[0]}的主要功能是什么？",
            f"如何搭建基于{keywords[0]}的{topic}系统？",
            f"解释{topic}中{keywords[0]}和{keywords[1]}的协作机制。",
            f"{topic}系统中{keywords[0]}的配置步骤是什么？",
            f"如何解决{topic}中{keywords[0]}的连接问题？",
            f"描述{topic}中{keywords[0]}的数据流向。",
            f"{topic}架构中{keywords[0]}的作用是什么？",
            f"比较{keywords[0]}和其他{topic}方案的特点。",
            f"{topic}项目实施中{keywords[0]}的关键成功因素是什么？",
            f"{topic}标准化进程中{keywords[0]}的贡献是什么？"
        ]
        
        answer_templates = [
            f"{keywords[0]}负责数据采集、处理和传输到云端",
            f"硬件选型→固件开发→云端配置→数据对接→前端展示",
            f"{keywords[0]}采集数据，{keywords[1]}传输到服务器",
            f"配置网络参数、设置主题、定义数据格式、测试连通性",
            f"检查网络连接、验证凭证、查看日志、重启设备",
            f"传感器→MCU→通信模块→网关→云平台→应用层",
            f"桥接物理世界和数字世界，实现远程监控和控制",
            f"MQTT轻量适合低功耗，HTTP通用但开销大，CoAP专为IoT设计",
            f"明确需求、合理选型、充分测试、持续运维、用户培训",
            f"统一接口、互操作性、安全性、可扩展性、向后兼容"
        ]
        
        kp_templates = [
            ["物联网", topic, keywords[0]],
            ["嵌入式系统", topic, keywords[1]],
            ["云计算", topic, "分布式系统"],
            ["网络安全", topic, "数据安全"],
            ["无线通信", topic, "协议栈"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "iot",
            "source": "stem_education_extended"
        })
    
    return questions

def generate_ai_questions(count=100):
    """生成人工智能题目"""
    topics = [
        ("机器学习", ["监督学习", "无监督学习", "强化学习", "深度学习", "迁移学习"]),
        ("神经网络", ["CNN", "RNN", "LSTM", "Transformer", "GAN"]),
        ("自然语言处理", ["词向量", "注意力机制", "BERT", "GPT", "机器翻译"]),
        ("计算机视觉", ["图像分类", "目标检测", "语义分割", "人脸识别", "姿态估计"]),
        ("数据处理", ["数据清洗", "特征工程", "数据增强", "标注", "归一化"]),
        ("模型训练", ["损失函数", "优化器", "正则化", "超参数调优", "交叉验证"]),
        ("模型部署", ["ONNX", "TensorRT", "量化", "剪枝", "边缘推理"]),
        ("伦理与安全", ["偏见", "隐私", "可解释性", "公平性", "责任归属"]),
        ("应用场景", ["智能客服", "推荐系统", "自动驾驶", "医疗诊断", "金融风控"]),
        ("工具框架", ["TensorFlow", "PyTorch", "Keras", "Scikit-learn", "HuggingFace"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.4, 0.9), 1)
        
        question_templates = [
            f"人工智能{topic}中{keywords[0]}的核心思想是什么？",
            f"如何实现基于{keywords[0]}的{topic}模型？",
            f"解释{topic}中{keywords[0]}和{keywords[1]}的区别。",
            f"{topic}模型训练中{keywords[0]}的作用是什么？",
            f"如何解决{topic}中{keywords[0]}导致的过拟合问题？",
            f"描述{topic}中{keywords[0]}的工作机制。",
            f"{topic}应用中{keywords[0]}的优势和局限是什么？",
            f"比较{keywords[0]}和其他{topic}方法的性能。",
            f"{topic}研究中{keywords[0]}的最新进展是什么？",
            f"{topic}教育中{keywords[0]}的教学重点是什么？"
        ]
        
        answer_templates = [
            f"{keywords[0]}从数据中学习模式，自动做出预测或决策",
            f"准备数据→选择模型→训练→评估→调优→部署",
            f"{keywords[0]}需要标注数据，{keywords[1]}无需标注",
            f"{keywords[0]}衡量预测误差，指导模型参数更新",
            f"增加数据量、正则化、Dropout、早停、简化模型",
            f"输入层→隐藏层（多层）→输出层，反向传播更新权重",
            f"优势：自动化、高精度；局限：黑盒、需大量数据",
            f"CNN适合图像，RNN适合序列，Transformer适合长依赖",
            f"大模型、多模态、自监督学习、联邦学习、神经符号AI",
            f"基本概念、数学基础、编程实践、伦理意识、应用能力"
        ]
        
        kp_templates = [
            ["人工智能", topic, keywords[0]],
            ["机器学习", topic, keywords[1]],
            ["数据科学", topic, "统计分析"],
            ["深度学习", topic, "神经网络"],
            ["认知科学", topic, "智能系统"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "ai_ml",
            "source": "stem_education_extended"
        })
    
    return questions

def generate_engineering_questions(count=130):
    """生成工程设计与创客题目"""
    topics = [
        ("设计流程", ["需求分析", "概念设计", "详细设计", "原型制作", "测试迭代"]),
        ("创意思维", ["头脑风暴", "思维导图", "SCAMPER", "六顶思考帽", "TRIZ"]),
        ("原型制作", ["低保真", "高保真", "3D打印", "激光切割", "手工制作"]),
        ("用户研究", ["访谈", "问卷", "观察", "可用性测试", "A/B测试"]),
        ("项目管理", ["甘特图", "里程碑", "风险管理", "资源分配", "进度控制"]),
        ("成本控制", ["BOM表", "供应链", "批量生产", " economies of scale", "价值工程"]),
        ("可持续设计", ["生命周期评估", "可回收材料", "节能设计", "碳足迹", "循环经济"]),
        ("人机交互", ["用户体验", "界面设计", "无障碍设计", "情感化设计", "包容性设计"]),
        ("制造工艺", ["注塑", "CNC加工", "钣金", "焊接", "表面处理"]),
        ("知识产权", ["专利", "商标", "版权", "开源许可", "商业秘密"])
    ]
    
    questions = []
    for i in range(count):
        topic, keywords = random.choice(topics)
        difficulty = round(random.uniform(0.3, 0.8), 1)
        
        question_templates = [
            f"工程设计中{topic}的{keywords[0]}阶段做什么？",
            f"如何运用{keywords[0]}方法进行{topic}？",
            f"解释{topic}中{keywords[0]}和{keywords[1]}的关系。",
            f"{topic}过程中{keywords[0]}的关键成功因素是什么？",
            f"如何解决{topic}中{keywords[0]}遇到的常见问题？",
            f"描述{topic}中{keywords[0]}的实施步骤。",
            f"{topic}实践中{keywords[0]}的最佳案例有哪些？",
            f"比较{keywords[0]}和其他{topic}工具的适用场景。",
            f"{topic}教育中{keywords[0]}的培养方法是什么？",
            f"{topic}行业发展中{keywords[0]}的趋势是什么？"
        ]
        
        answer_templates = [
            f"{keywords[0]}明确问题和约束条件，定义成功标准",
            f"发散思维产生创意，收敛思维筛选方案，迭代优化",
            f"{keywords[0]}发现问题，{keywords[1]}验证解决方案",
            f"跨学科团队、用户参与、快速原型、持续反馈",
            f"重新审视需求、调整方案、寻求替代方案、求助专家",
            f"调研→构思→草图→建模→原型→测试→改进→定稿",
            f"Apple产品设计、IDEO咨询、特斯拉创新、大疆无人机",
            f"早期用草图和纸模，后期用CAD和3D打印",
            f"PBL项目式学习、设计挑战赛、创客工作坊、企业实习",
            f"智能化、个性化、可持续、数字化、协同化"
        ]
        
        kp_templates = [
            ["工程设计", topic, keywords[0]],
            ["创新思维", topic, keywords[1]],
            ["产品开发", topic, "全生命周期"],
            ["用户体验", topic, "以人为本"],
            ["可持续工程", topic, "绿色设计"]
        ]
        
        questions.append({
            "content": random.choice(question_templates),
            "answer": random.choice(answer_templates),
            "difficulty": difficulty,
            "knowledge_points": random.choice(kp_templates),
            "category": "engineering",
            "source": "stem_education_extended"
        })
    
    return questions

def import_to_neo4j(questions):
    """批量导入题目到Neo4j"""
    print("=" * 70)
    print("🚀 批量导入STEM题库到Neo4j")
    print("=" * 70)
    print(f"📊 待导入题目总数: {len(questions)}")
    print()
    
    driver = neo4j.GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    try:
        with driver.session() as session:
            imported = 0
            batch_size = 50
            
            for i in range(0, len(questions), batch_size):
                batch = questions[i:i+batch_size]
                
                for idx, q in enumerate(batch):
                    question_id = f"stem-ext-{q['category']}-{imported + 1:04d}"
                    
                    query = """
                    MERGE (q:Question {id: $id})
                    SET q.content = $content,
                        q.answer = $answer,
                        q.difficulty = $difficulty,
                        q.knowledge_points = $knowledge_points,
                        q.category = $category,
                        q.source = $source,
                        q.created_at = datetime()
                    RETURN q.id as id
                    """
                    
                    result = session.run(query, {
                        "id": question_id,
                        "content": q["content"],
                        "answer": q["answer"],
                        "difficulty": q["difficulty"],
                        "knowledge_points": json.dumps(q["knowledge_points"]),
                        "category": q["category"],
                        "source": q["source"]
                    })
                    
                    if result.single():
                        imported += 1
                        if (imported % 100 == 0) or (imported == len(questions)):
                            print(f"✅ 已导入 {imported}/{len(questions)} 题")
            
            print("\n" + "=" * 70)
            print(f"✅ 导入完成！共导入 {imported} 道STEM题目")
            print("=" * 70)
            
            # 统计信息
            stats_query = """
            MATCH (q:Question {source: 'stem_education_extended'})
            RETURN count(q) as total,
                   count(DISTINCT q.category) as categories
            """
            stats = session.run(stats_query).single()
            print(f"\n📊 数据库统计:")
            print(f"   STEM扩展题目总数: {stats['total']}")
            print(f"   题库分类数: {stats['categories']}")
            
    except Exception as e:
        print(f"\n❌ 导入失败: {e}")
        raise
    finally:
        driver.close()

def main():
    """主函数"""
    print("\n" + "=" * 70)
    print("🎯 生成1000道STEM教育扩展题库")
    print("=" * 70)
    
    # 生成各分类题目
    all_questions = []
    
    print("\n📝 生成Arduino题目...")
    arduino_qs = generate_arduino_questions(150)
    all_questions.extend(arduino_qs)
    print(f"   ✅ 生成 {len(arduino_qs)} 题")
    
    print("\n📝 生成机器人技术题目...")
    robotics_qs = generate_robotics_questions(150)
    all_questions.extend(robotics_qs)
    print(f"   ✅ 生成 {len(robotics_qs)} 题")
    
    print("\n📝 生成编程与计算思维题目...")
    programming_qs = generate_programming_questions(150)
    all_questions.extend(programming_qs)
    print(f"   ✅ 生成 {len(programming_qs)} 题")
    
    print("\n📝 生成电子电路题目...")
    electronics_qs = generate_electronics_questions(120)
    all_questions.extend(electronics_qs)
    print(f"   ✅ 生成 {len(electronics_qs)} 题")
    
    print("\n📝 生成3D打印题目...")
    printing_qs = generate_3d_printing_questions(100)
    all_questions.extend(printing_qs)
    print(f"   ✅ 生成 {len(printing_qs)} 题")
    
    print("\n📝 生成物联网题目...")
    iot_qs = generate_iot_questions(100)
    all_questions.extend(iot_qs)
    print(f"   ✅ 生成 {len(iot_qs)} 题")
    
    print("\n📝 生成人工智能题目...")
    ai_qs = generate_ai_questions(100)
    all_questions.extend(ai_qs)
    print(f"   ✅ 生成 {len(ai_qs)} 题")
    
    print("\n📝 生成工程设计与创客题目...")
    engineering_qs = generate_engineering_questions(130)
    all_questions.extend(engineering_qs)
    print(f"   ✅ 生成 {len(engineering_qs)} 题")
    
    print(f"\n📊 总计生成: {len(all_questions)} 道题目")
    
    # 保存到JSON文件
    output_file = Path('data/question_library/stem_education_extended.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    print(f"💾 保存到: {output_file}")
    
    # 导入到Neo4j
    import_to_neo4j(all_questions)
    
    print("\n🎉 全部完成！")

if __name__ == "__main__":
    main()
