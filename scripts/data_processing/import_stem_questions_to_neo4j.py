#!/usr/bin/env python3
"""
批量爬取STEM教育题目并导入Neo4j
涵盖：Arduino、机器人、编程、电子电路、3D打印、物联网、AI等
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
import neo4j

# Neo4j配置
NEO4J_URI = "neo4j+s://4abd5ef9.databases.neo4j.io"
NEO4J_USER = "4abd5ef9"
NEO4J_PASSWORD = "bXebDaB8hSalBxvvB5GhHmcvudO03ilZB7qItmI0Xbs"

# STEM题库定义
STEM_QUESTION_BANKS = [
    {
        "name": "Arduino编程基础",
        "category": "arduino",
        "questions": [
            {"content": "Arduino Uno有多少个数字I/O引脚？", "answer": "14个（D0-D13）", "difficulty": 0.3, "knowledge_points": ["Arduino硬件", "引脚配置"]},
            {"content": "PWM引脚在Arduino板上用什么符号标记？", "answer": "~（波浪号）", "difficulty": 0.3, "knowledge_points": ["PWM", "引脚标识"]},
            {"content": "digitalWrite()函数的两个参数是什么？", "answer": "引脚号和状态（HIGH/LOW）", "difficulty": 0.2, "knowledge_points": ["数字输出", "GPIO"]},
            {"content": "analogRead()函数的返回值范围是多少？", "answer": "0-1023", "difficulty": 0.4, "knowledge_points": ["模拟输入", "ADC"]},
            {"content": "delay()函数的单位是什么？", "answer": "毫秒（ms）", "difficulty": 0.2, "knowledge_points": ["延时函数", "时间控制"]},
            {"content": "Serial.begin(9600)中的9600代表什么？", "answer": "波特率（每秒传输9600位）", "difficulty": 0.4, "knowledge_points": ["串口通信", "波特率"]},
            {"content": "pinMode(pin, INPUT_PULLUP)的作用是什么？", "answer": "设置引脚为输入并启用内部上拉电阻", "difficulty": 0.5, "knowledge_points": ["输入模式", "上拉电阻"]},
            {"content": "Arduino的setup()函数执行几次？", "answer": "仅一次（程序启动时）", "difficulty": 0.2, "knowledge_points": ["程序结构", "初始化"]},
            {"content": "map(value, 0, 1023, 0, 255)的作用是什么？", "answer": "将0-1023的值映射到0-255范围", "difficulty": 0.5, "knowledge_points": ["数值映射", "数据处理"]},
            {"content": "tone(pin, frequency)函数生成什么信号？", "answer": "指定频率的方波信号（用于蜂鸣器）", "difficulty": 0.4, "knowledge_points": ["音频输出", "PWM应用"]},
        ]
    },
    {
        "name": "机器人技术",
        "category": "robotics",
        "questions": [
            {"content": "循迹小车使用什么原理检测黑色线条？", "answer": "红外反射原理（黑色吸收红外线，白色反射）", "difficulty": 0.4, "knowledge_points": ["传感器", "循迹算法", "红外线"]},
            {"content": "PID控制中的P代表什么？", "answer": "比例（Proportional）", "difficulty": 0.6, "knowledge_points": ["控制算法", "PID", "反馈控制"]},
            {"content": "超声波传感器HC-SR04的最大测距是多少？", "answer": "约4米（400cm）", "difficulty": 0.3, "knowledge_points": ["超声波", "测距传感器"]},
            {"content": "舵机的控制信号是什么类型的？", "answer": "PWM信号（脉宽调制）", "difficulty": 0.5, "knowledge_points": ["舵机控制", "PWM", "执行器"]},
            {"content": "机器人避障常用的传感器有哪些？（至少说出2种）", "answer": "超声波传感器、红外传感器、激光雷达、碰撞开关", "difficulty": 0.4, "knowledge_points": ["避障", "传感器融合"]},
            {"content": "差速驱动的原理是什么？", "answer": "通过控制左右轮速度差实现转向", "difficulty": 0.5, "knowledge_points": ["运动控制", "差速转向"]},
            {"content": "什么是机器人的自由度（DOF）？", "answer": "机器人能够独立运动的轴数或关节数", "difficulty": 0.5, "knowledge_points": ["机器人学基础", "自由度"]},
            {"content": "SLAM技术的含义是什么？", "answer": "同步定位与地图构建（Simultaneous Localization and Mapping）", "difficulty": 0.7, "knowledge_points": ["SLAM", "导航", "地图构建"]},
            {"content": "L298N模块的主要功能是什么？", "answer": "电机驱动（控制直流电机方向和速度）", "difficulty": 0.4, "knowledge_points": ["电机驱动", "H桥电路"]},
            {"content": "什么是机器人运动学逆解？", "answer": "根据末端执行器位置计算各关节角度", "difficulty": 0.7, "knowledge_points": ["运动学", "逆运动学"]},
        ]
    },
    {
        "name": "编程与计算思维",
        "category": "programming",
        "questions": [
            {"content": "Scratch中'重复执行'积木属于什么编程结构？", "answer": "循环结构", "difficulty": 0.2, "knowledge_points": ["Scratch", "循环", "编程基础"]},
            {"content": "什么是变量？", "answer": "用于存储数据的命名容器，值可以改变", "difficulty": 0.2, "knowledge_points": ["变量", "数据存储"]},
            {"content": "条件语句（if-else）的作用是什么？", "answer": "根据条件真假执行不同的代码分支", "difficulty": 0.3, "knowledge_points": ["条件判断", "分支结构"]},
            {"content": "什么是函数/过程？", "answer": "封装的可重复使用的代码块", "difficulty": 0.3, "knowledge_points": ["函数", "代码复用"]},
            {"content": "列表（数组）和单个变量有什么区别？", "answer": "列表可以存储多个值，通过索引访问", "difficulty": 0.4, "knowledge_points": ["数据结构", "列表", "数组"]},
            {"content": "什么是递归？", "answer": "函数调用自身的编程技术", "difficulty": 0.6, "knowledge_points": ["递归", "算法"]},
            {"content": "调试（Debug）的目的是什么？", "answer": "发现并修复程序中的错误", "difficulty": 0.2, "knowledge_points": ["调试", "错误处理"]},
            {"content": "什么是算法？", "answer": "解决问题的明确步骤和规则", "difficulty": 0.3, "knowledge_points": ["算法", "计算思维"]},
            {"content": "二进制数1010转换为十进制是多少？", "answer": "10", "difficulty": 0.4, "knowledge_points": ["二进制", "数制转换"]},
            {"content": "什么是API？", "answer": "应用程序编程接口（Application Programming Interface）", "difficulty": 0.5, "knowledge_points": ["API", "接口", "系统集成"]},
        ]
    },
    {
        "name": "电子电路基础",
        "category": "electronics",
        "questions": [
            {"content": "欧姆定律的公式是什么？", "answer": "V = I × R（电压=电流×电阻）", "difficulty": 0.4, "knowledge_points": ["欧姆定律", "电路基础"]},
            {"content": "LED为什么要串联电阻？", "answer": "限制电流，防止LED烧毁", "difficulty": 0.3, "knowledge_points": ["LED", "限流电阻"]},
            {"content": "串联电路和并联电路的区别是什么？", "answer": "串联电流相同电压分配，并联电压相同电流分配", "difficulty": 0.5, "knowledge_points": ["串联", "并联", "电路分析"]},
            {"content": "电容的主要功能是什么？", "answer": "存储电荷、滤波、耦合", "difficulty": 0.5, "knowledge_points": ["电容", "元件功能"]},
            {"content": "什么是短路？有什么危害？", "answer": "电流不经过负载直接流通，会导致过大电流损坏元件", "difficulty": 0.3, "knowledge_points": ["短路", "电路安全"]},
            {"content": "万用表可以测量哪些物理量？", "answer": "电压、电流、电阻（有的还能测电容、频率等）", "difficulty": 0.3, "knowledge_points": ["测量工具", "万用表"]},
            {"content": "什么是面包板？它的作用是什么？", "answer": "无需焊接即可搭建电路的原型板", "difficulty": 0.2, "knowledge_points": ["面包板", "原型设计"]},
            {"content": "继电器的工作原理是什么？", "answer": "用小电流控制大电流的电磁开关", "difficulty": 0.5, "knowledge_points": ["继电器", "电磁控制"]},
            {"content": "什么是上拉电阻和下拉电阻？", "answer": "上拉将引脚默认拉高电平，下拉将引脚默认拉低电平", "difficulty": 0.5, "knowledge_points": ["上拉电阻", "下拉电阻", "数字电路"]},
            {"content": "三极管的三种工作状态是什么？", "answer": "截止区、放大区、饱和区", "difficulty": 0.6, "knowledge_points": ["三极管", "晶体管", "放大电路"]},
        ]
    },
    {
        "name": "3D打印与制造",
        "category": "3d_printing",
        "questions": [
            {"content": "FDM 3D打印技术的含义是什么？", "answer": "熔融沉积成型（Fused Deposition Modeling）", "difficulty": 0.4, "knowledge_points": ["3D打印", "FDM", "制造工艺"]},
            {"content": "3D打印常用的塑料材料有哪些？", "answer": "PLA、ABS、PETG、TPU等", "difficulty": 0.4, "knowledge_points": ["打印材料", "PLA", "ABS"]},
            {"content": "什么是切片软件？", "answer": "将3D模型转换为打印机可识别的G代码的程序", "difficulty": 0.4, "knowledge_points": ["切片软件", "G代码", "CAM"]},
            {"content": "3D打印的支撑结构（Support）有什么用？", "answer": "支撑悬空部分，防止打印失败", "difficulty": 0.3, "knowledge_points": ["支撑结构", "打印技巧"]},
            {"content": "PLA和ABS材料的主要区别是什么？", "answer": "PLA环保易打印但强度低，ABS强度高但需要加热床", "difficulty": 0.5, "knowledge_points": ["材料对比", "PLA", "ABS"]},
            {"content": "什么是层高（Layer Height）？", "answer": "每层打印的厚度，影响精度和打印时间", "difficulty": 0.4, "knowledge_points": ["层高", "打印参数"]},
            {"content": "3D打印前模型需要导出为什么格式？", "answer": "STL或OBJ格式", "difficulty": 0.3, "knowledge_points": ["文件格式", "STL", "3D建模"]},
            {"content": "什么是填充率（Infill）？", "answer": "模型内部的填充密度百分比", "difficulty": 0.4, "knowledge_points": ["填充率", "打印设置"]},
            {"content": "热床（Heated Bed）的作用是什么？", "answer": "防止模型翘边，提高附着力", "difficulty": 0.4, "knowledge_points": ["热床", "打印床", "附着力"]},
            {"content": "3D扫描仪的工作原理是什么？", "answer": "通过激光或结构光获取物体表面三维数据", "difficulty": 0.5, "knowledge_points": ["3D扫描", "逆向工程"]},
        ]
    },
    {
        "name": "物联网（IoT）",
        "category": "iot",
        "questions": [
            {"content": "IoT的完整英文是什么？", "answer": "Internet of Things（物联网）", "difficulty": 0.2, "knowledge_points": ["物联网", "概念定义"]},
            {"content": "ESP8266模块的主要功能是什么？", "answer": "WiFi通信（让设备联网）", "difficulty": 0.4, "knowledge_points": ["ESP8266", "WiFi模块", "网络连接"]},
            {"content": "MQTT协议的特点是什么？", "answer": "轻量级、发布/订阅模式、适合低带宽环境", "difficulty": 0.6, "knowledge_points": ["MQTT", "通信协议", "物联网协议"]},
            {"content": "什么是传感器节点？", "answer": "采集环境数据并发送到网络的设备", "difficulty": 0.3, "knowledge_points": ["传感器", "数据采集"]},
            {"content": "智能家居中常见的通信协议有哪些？", "answer": "WiFi、蓝牙、Zigbee、Z-Wave", "difficulty": 0.5, "knowledge_points": ["通信协议", "智能家居"]},
            {"content": "什么是边缘计算？", "answer": "在数据源附近进行数据处理，减少云端传输", "difficulty": 0.6, "knowledge_points": ["边缘计算", "数据处理"]},
            {"content": "DHT11传感器可以测量什么？", "answer": "温度和湿度", "difficulty": 0.3, "knowledge_points": ["DHT11", "温湿度传感器"]},
            {"content": "什么是云平台？在IoT中的作用是什么？", "answer": "远程服务器，用于存储、分析和展示IoT数据", "difficulty": 0.4, "knowledge_points": ["云平台", "数据存储"]},
            {"content": "蓝牙和WiFi的主要区别是什么？", "answer": "蓝牙短距离低功耗，WiFi距离远速度快但功耗高", "difficulty": 0.4, "knowledge_points": ["蓝牙", "WiFi", "无线通信"]},
            {"content": "什么是智能网关？", "answer": "连接不同协议设备并转发数据到云端的中间设备", "difficulty": 0.5, "knowledge_points": ["网关", "协议转换"]},
        ]
    },
    {
        "name": "人工智能基础",
        "category": "ai_ml",
        "questions": [
            {"content": "什么是机器学习？", "answer": "让计算机从数据中自动学习和改进的技术", "difficulty": 0.4, "knowledge_points": ["机器学习", "AI基础"]},
            {"content": "监督学习和无监督学习的区别是什么？", "answer": "监督学习有标注数据，无监督学习没有标注", "difficulty": 0.5, "knowledge_points": ["监督学习", "无监督学习"]},
            {"content": "什么是神经网络？", "answer": "模仿人脑神经元结构的计算模型", "difficulty": 0.5, "knowledge_points": ["神经网络", "深度学习"]},
            {"content": "图像识别属于AI的哪个应用领域？", "answer": "计算机视觉（Computer Vision）", "difficulty": 0.4, "knowledge_points": ["计算机视觉", "图像识别"]},
            {"content": "什么是训练集和测试集？", "answer": "训练集用于学习，测试集用于评估模型性能", "difficulty": 0.4, "knowledge_points": ["数据集", "模型评估"]},
            {"content": "过拟合（Overfitting）是什么问题？", "answer": "模型在训练集表现好但在新数据表现差", "difficulty": 0.6, "knowledge_points": ["过拟合", "泛化能力"]},
            {"content": "什么是自然语言处理（NLP）？", "answer": "让计算机理解和生成人类语言的技术", "difficulty": 0.4, "knowledge_points": ["NLP", "自然语言处理"]},
            {"content": "ChatGPT使用的是哪种AI技术？", "answer": "大语言模型（LLM），基于Transformer架构", "difficulty": 0.5, "knowledge_points": ["大语言模型", "Transformer", "GPT"]},
            {"content": "什么是特征（Feature）？", "answer": "用于训练模型的输入数据属性", "difficulty": 0.4, "knowledge_points": ["特征工程", "数据预处理"]},
            {"content": "AI伦理中需要关注哪些问题？", "answer": "隐私保护、算法偏见、数据安全、就业影响等", "difficulty": 0.5, "knowledge_points": ["AI伦理", "社会责任"]},
        ]
    },
    {
        "name": "工程设计与创客",
        "category": "engineering",
        "questions": [
            {"content": "工程设计流程的第一步是什么？", "answer": "定义问题（明确需求）", "difficulty": 0.3, "knowledge_points": ["设计流程", "问题定义"]},
            {"content": "什么是原型（Prototype）？", "answer": "产品的初步模型，用于测试和验证", "difficulty": 0.3, "knowledge_points": ["原型", "产品开发"]},
            {"content": "头脑风暴（Brainstorming）的规则有哪些？", "answer": "不批评、追求数量、鼓励疯狂想法、结合改进", "difficulty": 0.3, "knowledge_points": ["头脑风暴", "创意思维"]},
            {"content": "什么是迭代设计？", "answer": "通过多次测试和改进逐步完善设计", "difficulty": 0.4, "knowledge_points": ["迭代", "设计改进"]},
            {"content": "用户测试的目的是什么？", "answer": "验证设计是否满足用户需求，发现问题", "difficulty": 0.3, "knowledge_points": ["用户测试", "可用性"]},
            {"content": "什么是人体工程学？", "answer": "研究人与产品/环境交互的学科，提高舒适性和效率", "difficulty": 0.5, "knowledge_points": ["人体工程学", "用户体验"]},
            {"content": "可持续性设计的原则是什么？", "answer": "减少资源消耗、可回收、环保材料、长寿命", "difficulty": 0.5, "knowledge_points": ["可持续设计", "环保"]},
            {"content": "什么是设计思维（Design Thinking）？", "answer": "以人为本的创新方法论（共情-定义-构思-原型-测试）", "difficulty": 0.5, "knowledge_points": ["设计思维", "创新方法"]},
            {"content": "成本效益分析的作用是什么？", "answer": "评估设计方案的经济可行性", "difficulty": 0.4, "knowledge_points": ["成本分析", "可行性"]},
            {"content": "什么是开源硬件？", "answer": "设计文件公开，任何人都可以制造和修改的硬件", "difficulty": 0.4, "knowledge_points": ["开源硬件", "创客文化"]},
        ]
    }
]

def import_to_neo4j():
    """将STEM题库导入Neo4j"""
    print("=" * 70)
    print("🚀 STEM题库导入Neo4j")
    print("=" * 70)
    
    driver = neo4j.GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    try:
        with driver.session() as session:
            total_questions = 0
            
            for bank in STEM_QUESTION_BANKS:
                bank_name = bank["name"]
                category = bank["category"]
                questions = bank["questions"]
                
                print(f"\n📚 导入题库: {bank_name} ({len(questions)}题)")
                print("-" * 70)
                
                for idx, q in enumerate(questions, 1):
                    question_id = f"stem-q-{category}-{idx:03d}"
                    
                    # 创建题目节点
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
                        "knowledge_points": q["knowledge_points"],
                        "category": category,
                        "source": "stem_education"
                    })
                    
                    if result.single():
                        print(f"  ✅ [{idx}/{len(questions)}] {q['content'][:40]}...")
                        total_questions += 1
                    else:
                        print(f"  ❌ [{idx}/{len(questions)}] 导入失败")
            
            print("\n" + "=" * 70)
            print(f"✅ 导入完成！共导入 {total_questions} 道STEM题目")
            print("=" * 70)
            
            # 统计信息
            stats_query = """
            MATCH (q:Question {source: 'stem_education'})
            RETURN count(q) as total,
                   count(DISTINCT q.category) as categories
            """
            stats = session.run(stats_query).single()
            print(f"\n📊 数据库统计:")
            print(f"   STEM题目总数: {stats['total']}")
            print(f"   题库分类数: {stats['categories']}")
            
    except Exception as e:
        print(f"\n❌ 导入失败: {e}")
        raise
    finally:
        driver.close()

if __name__ == "__main__":
    import_to_neo4j()
