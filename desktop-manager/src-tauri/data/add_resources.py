#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量添加开源教育资源到 open_resources.json
"""

import json
from pathlib import Path

def load_resources():
    """加载现有的资源文件"""
    json_path = Path(__file__).parent / "open_resources.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_resources(data):
    """保存资源文件"""
    json_path = Path(__file__).parent / "open_resources.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def add_openscied_resources(data):
    """添加更多 OpenSciEd 资源"""
    new_resources = [
        {
            "id": "os-bio-003",
            "title": "细胞结构与功能",
            "description": "使用显微镜观察动植物细胞，比较原核细胞与真核细胞的差异。理解细胞器的分工合作。",
            "source": "openscied",
            "subject": "biology",
            "level": "middle",
            "difficulty": 2,
            "has_hardware": True,
            "hardware_budget": 120,
            "download_url": "https://www.openscied.org/cell-structure",
            "learning_objectives": [
                "正确使用光学显微镜",
                "识别动植物细胞的主要结构",
                "解释各细胞器的功能"
            ],
            "materials_list": ["光学显微镜", "载玻片和盖玻片", "碘液染色剂", "洋葱"],
            "estimated_duration": "2周（8课时）"
        },
        {
            "id": "os-bio-004",
            "title": "人体免疫系统",
            "description": "探究身体如何抵御病原体入侵，理解疫苗的工作原理。通过模拟实验展示免疫反应过程。",
            "source": "openscied",
            "subject": "biology",
            "level": "high",
            "difficulty": 4,
            "has_hardware": False,
            "download_url": "https://www.openscied.org/immune-system",
            "learning_objectives": [
                "描述人体的三道防线",
                "解释特异性免疫和非特异性免疫",
                "说明疫苗诱导免疫记忆的机制"
            ],
            "estimated_duration": "3周（12课时）"
        },
        {
            "id": "os-phy-002",
            "title": "声音的传播与特性",
            "description": "探究声音的产生、传播和接收机制，理解频率、振幅与音调、响度的关系。制作简易乐器验证声学原理。",
            "source": "openscied",
            "subject": "physics",
            "level": "elementary",
            "difficulty": 2,
            "has_hardware": True,
            "hardware_budget": 25,
            "download_url": "https://www.openscied.org/sound-waves",
            "learning_objectives": [
                "说明声音是由物体振动产生的",
                "区分音调和响度的概念",
                "描述声音在不同介质中的传播速度差异"
            ],
            "materials_list": ["橡皮筋", "空盒子", "玻璃瓶", "水", "节拍器"],
            "estimated_duration": "2周（8课时）"
        },
        {
            "id": "os-phy-003",
            "title": "牛顿运动定律实验",
            "description": "通过气垫导轨实验验证牛顿第二定律，测量力、质量和加速度的关系。理解惯性的概念。",
            "source": "openscied",
            "subject": "physics",
            "level": "high",
            "difficulty": 4,
            "has_hardware": True,
            "hardware_budget": 150,
            "download_url": "https://www.openscied.org/newton-laws",
            "learning_objectives": [
                "陈述牛顿三大运动定律",
                "设计实验验证牛顿第二定律",
                "使用光电门精确测量加速度"
            ],
            "materials_list": ["气垫导轨", "滑块", "光电门计时器", "砝码和滑轮"],
            "estimated_duration": "3周（12课时）"
        },
        {
            "id": "os-chem-002",
            "title": "酸碱中和反应",
            "description": "通过滴定实验测定未知浓度溶液的pH值，理解酸碱指示剂的变色原理。",
            "source": "openscied",
            "subject": "chemistry",
            "level": "high",
            "difficulty": 3,
            "has_hardware": True,
            "hardware_budget": 50,
            "download_url": "https://www.openscied.org/acid-base-titration",
            "learning_objectives": [
                "定义酸和碱的Arrhenius理论",
                "正确使用滴定管进行滴定操作",
                "选择合适的酸碱指示剂"
            ],
            "materials_list": ["滴定管和滴定管夹", "锥形瓶", "标准盐酸溶液", "酚酞指示剂"],
            "estimated_duration": "2周（8课时）"
        }
    ]

    data["sources"]["openscied"].extend(new_resources)
    return data

def add_gewustan_resources(data):
    """添加更多格物斯坦资源"""
    new_resources = [
        {
            "id": "gw-004",
            "title": "Arduino基础编程",
            "description": "学习Arduino IDE使用，掌握数字/模拟IO、PWM、串口通信等基础知识。制作LED闪烁、按键控制等项目。",
            "source": "gewustan",
            "subject": "computer_science",
            "level": "middle",
            "difficulty": 2,
            "has_hardware": True,
            "hardware_budget": 55,
            "download_url": "https://gewustan.com/arduino-basics",
            "learning_objectives": [
                "安装并配置Arduino开发环境",
                "理解setup()和loop()函数结构",
                "控制数字和模拟引脚"
            ],
            "materials_list": ["Arduino Uno开发板", "USB数据线", "LED灯x3", "电阻220Ωx3", "按键开关"],
            "estimated_duration": "4周（16课时）"
        },
        {
            "id": "gw-005",
            "title": "3D打印与建模",
            "description": "学习Tinkercad 3D建模软件，设计个性化作品并使用3D打印机制作。理解增材制造原理。",
            "source": "gewustan",
            "subject": "engineering",
            "level": "middle",
            "difficulty": 3,
            "has_hardware": True,
            "hardware_budget": 200,
            "download_url": "https://gewustan.com/3d-printing",
            "learning_objectives": [
                "使用Tinkercad进行基本3D建模",
                "理解STL文件格式和切片软件",
                "操作FDM 3D打印机"
            ],
            "materials_list": ["电脑（安装Tinkercad）", "FDM 3D打印机", "PLA耗材", "铲刀和剪钳"],
            "estimated_duration": "4周（16课时）"
        },
        {
            "id": "gw-006",
            "title": "智能家居系统",
            "description": "使用ESP8266 WiFi模块和传感器搭建智能家居原型，实现远程监控和控制。学习物联网基础。",
            "source": "gewustan",
            "subject": "computer_science",
            "level": "high",
            "difficulty": 5,
            "has_hardware": True,
            "hardware_budget": 80,
            "download_url": "https://gewustan.com/smart-home",
            "learning_objectives": [
                "理解物联网架构和通信协议",
                "使用ESP8266连接WiFi网络",
                "读取传感器数据并上传云端"
            ],
            "materials_list": ["ESP8266 NodeMCU开发板", "DHT11温湿度传感器", "光敏电阻模块", "继电器模块"],
            "estimated_duration": "5周（20课时）"
        }
    ]

    data["sources"]["gewustan"].extend(new_resources)
    return data

def add_stemcloud_resources(data):
    """添加更多 stemcloud 资源"""
    new_resources = [
        {
            "id": "sc-004",
            "title": "植物生长与环境因素",
            "description": "探究光照、水分、温度、土壤等因素对植物生长的影响。设计对照实验，记录生长数据并分析。",
            "source": "stemcloud",
            "subject": "biology",
            "level": "elementary",
            "difficulty": 2,
            "has_hardware": True,
            "hardware_budget": 20,
            "download_url": "https://stemcloud.cn/plant-growth-factors",
            "learning_objectives": [
                "列出植物生长的基本条件",
                "设计公平的对照实验",
                "准确记录和整理实验数据"
            ],
            "materials_list": ["种子（豆芽或小麦草）", "花盆或育苗盘", "土壤", "量杯", "尺子"],
            "estimated_duration": "3周（持续观察）"
        },
        {
            "id": "sc-005",
            "title": "风力发电模型",
            "description": "设计并制作小型风力发电机，探究叶片形状、角度对发电效率的影响。理解可再生能源原理。",
            "source": "stemcloud",
            "subject": "physics",
            "level": "middle",
            "difficulty": 3,
            "has_hardware": True,
            "hardware_budget": 35,
            "download_url": "https://stemcloud.cn/wind-power",
            "learning_objectives": [
                "解释风能转化为电能的原理",
                "设计高效的风力涡轮叶片",
                "测量不同条件下的发电功率"
            ],
            "materials_list": ["小电机", "LED灯", "硬纸板", "风扇", "万用表"],
            "estimated_duration": "3周（12课时）"
        },
        {
            "id": "sc-006",
            "title": "机器人编程入门",
            "description": "使用图形化编程软件控制机器人完成巡线、避障、搬运等任务。培养计算思维。",
            "source": "stemcloud",
            "subject": "computer_science",
            "level": "elementary",
            "difficulty": 2,
            "has_hardware": True,
            "hardware_budget": 120,
            "download_url": "https://stemcloud.cn/robot-programming",
            "learning_objectives": [
                "使用Scratch或类似工具编程",
                "理解顺序、循环、条件分支",
                "调试和优化程序"
            ],
            "materials_list": ["教育机器人套装", "平板电脑或电脑", "任务场地"],
            "estimated_duration": "4周（16课时）"
        }
    ]

    data["sources"]["stemcloud"].extend(new_resources)
    return data

def main():
    print("开始扩充资源库...")

    # 加载现有数据
    data = load_resources()

    # 添加新资源
    data = add_openscied_resources(data)
    data = add_gewustan_resources(data)
    data = add_stemcloud_resources(data)

    # 更新总数
    total = sum(len(v) for v in data["sources"].values())
    data["total_count"] = total
    data["last_updated"] = "2026-04-12"

    # 保存
    save_resources(data)

    print(f"✓ 完成！当前资源总数: {total}")
    print(f"  - OpenSciEd: {len(data['sources']['openscied'])} 个")
    print(f"  - 格物斯坦: {len(data['sources']['gewustan'])} 个")
    print(f"  - stemcloud: {len(data['sources']['stemcloud'])} 个")

if __name__ == "__main__":
    main()
