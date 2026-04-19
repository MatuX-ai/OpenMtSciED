"""
补充ROS机器人操作系统STEM课件 - 精简版
涵盖ROS基础、导航、视觉、机械臂等核心内容
"""

import json
from pathlib import Path
from datetime import datetime

def generate_ros_courses():
    """生成ROS STEM课件（精简版）"""
    
    ros_curriculum = {
        "ROS基础": {
            "elementary": [
                "认识ROS", "安装配置", "节点概念", "话题通信",
                "服务通信", "参数服务器", "launch文件", "rqt工具",
                "turtlesim仿真", "海龟控制", "简单示例", "项目实战"
            ],
            "middle": [
                "C++节点开发", "Python节点", "自定义消息", "TF坐标变换",
                "URDF建模", "Gazebo仿真", "RViz可视化", "rosbag记录",
                "导航框架", "SLAM建图", "激光雷达", "项目实战"
            ],
            "high": [
                "ROS2架构", "DDS通信", "组件化设计", "实时系统",
                "分布式部署", "容器化", "性能优化", "安全通信",
                "云平台集成", "数字孪生", "混合现实", "项目实战"
            ]
        },
        "机器人导航": {
            "elementary": [
                "导航概念", "里程计", "超声波避障", "红外巡线",
                "简单地图", "A*算法", "目标导航", "行为树",
                "多目标点", "路径规划", "动态避障", "项目实战"
            ],
            "middle": [
                "AMCL定位", "TEB规划器", "代价地图", "恢复行为",
                "视觉里程计", "RGB-D相机", "人腿检测", "多机器人",
                "室外GPS", "语义地图", "强化学习", "项目实战"
            ],
            "high": [
                "LIO-SAM", "VINS-Fusion", "ORB-SLAM3", "神经辐射场",
                "语义SLAM", "拓扑地图", "多模态融合", "动态环境",
                "群体导航", "水下导航", "空中导航", "项目实战"
            ]
        },
        "机器视觉": {
            "elementary": [
                "OpenCV基础", "摄像头驱动", "颜色识别", "形状识别",
                "二维码识别", "AprilTag", "人脸检测", "物体追踪",
                "边缘检测", "图像滤波", "简单分类", "项目实战"
            ],
            "middle": [
                "深度学习CNN", "YOLO检测", "语义分割", "实例分割",
                "姿态估计", "手势识别", "立体视觉", "光流法",
                "相机标定", "点云处理", "3D重建", "项目实战"
            ],
            "high": [
                "Transformer视觉", "多模态学习", "神经渲染", "事件相机",
                "类脑视觉", "联邦学习", "边缘AI", "可解释AI",
                "对抗攻击", "元宇宙视觉", "量子成像", "项目实战"
            ]
        },
        "机械臂控制": {
            "elementary": [
                "机械臂简介", "正运动学", "逆运动学", "MoveIt!",
                "关节空间规划", "笛卡尔空间", "抓取规划", "碰撞检测",
                "轨迹执行", "示教编程", "视觉引导", "项目实战"
            ],
            "middle": [
                "动力学建模", "阻抗控制", "导纳控制", "冗余机械臂",
                "双臂协调", "柔性关节", "触觉反馈", "软体机械臂",
                "遥操作", "自主学习", "数字孪生", "项目实战"
            ],
            "high": [
                "全身控制WBC", "模型预测控制MPC", "学习型控制", "分布式控制",
                "云边协同", "5G远程控制", "脑机接口", "纳米机器人",
                "太空机械臂", "伦理法律", "未来趋势", "项目实战"
            ]
        }
    }
    
    all_courses = []
    course_id = 15000
    
    for field, levels in ros_curriculum.items():
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
                    "course_id": f"ROS-{field[:4].upper()}-{level[:3].upper()}-{course_id}",
                    "title": f"{topic}（{grade_range}·{field}）",
                    "source": "ROS机器人教育专项课程",
                    "grade_level": level,
                    "target_grade": grade_range,
                    "subject": field,
                    "lesson_number": i + 1,
                    "duration_minutes": duration_minutes,
                    "complexity": complexity,
                    "description": f"{grade_range}{field}课程：{topic}",
                    "knowledge_points": [
                        {"kp_id": f"KP-ROS-{course_id}-01", "name": "核心概念", "description": f"{topic}的基础知识"},
                        {"kp_id": f"KP-ROS-{course_id}-02", "name": "实践技能", "description": f"{topic}的开发实践能力"}
                    ],
                    "experiments": [
                        {"name": f"{topic}实验", "materials": ["Ubuntu电脑", "ROS系统"], "low_cost_alternatives": ["Gazebo仿真", "在线实验室"]}
                    ],
                    "learning_objectives": [f"掌握{topic}", f"能够应用{topic}"],
                    "assessment_methods": ["代码审查", "功能测试", "项目演示"],
                    "ros_version": "ROS1/ROS2",
                    "programming_languages": ["Python", "C++"],
                    "tools": ["rviz", "Gazebo", "rqt"],
                    "project_examples": f"{topic}综合项目",
                    "career_paths": ["ROS工程师", "机器人开发工程师"],
                    "stem_connections": ["计算机", "数学", "物理", "工程"],
                    "course_url": f"https://ros-stem.edu/{level}/{field}/{course_id}",
                    "scraped_at": datetime.now().isoformat()
                }
                all_courses.append(course)
                course_id += 1
    
    print(f"✅ 生成ROS STEM课程: {len(all_courses)}个")
    
    # 统计
    stats = {}
    for c in all_courses:
        key = f"{c['target_grade']}-{c['subject']}"
        stats[key] = stats.get(key, 0) + 1
    
    print("\n按年级-学科分布:")
    for key, cnt in sorted(stats.items()):
        print(f"  {key}: {cnt}")
    
    age_stats = {}
    for c in all_courses:
        lvl = c['grade_level']
        age_stats[lvl] = age_stats.get(lvl, 0) + 1
    
    print("\n年龄段分布:")
    for lvl, cnt in sorted(age_stats.items()):
        print(f"  {lvl}: {cnt}")
    
    output_file = Path('data/course_library/ros_courses.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_courses, f, ensure_ascii=False, indent=2)
    
    print(f"\n📁 保存到: {output_file}")
    return len(all_courses)

if __name__ == "__main__":
    generate_ros_courses()
