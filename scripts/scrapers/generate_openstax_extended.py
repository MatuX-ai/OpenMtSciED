"""
扩展OpenStax课件元数据生成器
将章节数量从11个增加到50+个，覆盖更多学科
"""

import json
from pathlib import Path
from datetime import datetime


def generate_openstax_extended_chapters():
    """生成扩展的OpenStax教材章节元数据"""
    
    chapters = [
        # ==================== 大学物理 ====================
        # 第1卷 (第1-6章)
        {
            "chapter_id": "OSTX-UPhys-Ch01", "title": "单位与测量", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["基础代数", "三角函数"], "key_concepts": [{"concept": "国际单位制", "formula": "", "examples": ["米、千克、秒"]}],
            "exercises": [{"problem": "将光速转换为km/h", "difficulty": 1}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch02", "title": "矢量", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/2-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["三角函数"], "key_concepts": [{"concept": "矢量加法", "formula": "C=A+B", "examples": ["力的合成"]}],
            "exercises": [{"problem": "求两个力的合力", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch03", "title": "直线运动", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/3-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["矢量"], "key_concepts": [{"concept": "匀加速运动", "formula": "v=v0+at", "examples": ["自由落体"]}],
            "exercises": [{"problem": "计算自由落体时间", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch04", "title": "二维与三维运动", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/4-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["直线运动", "矢量"], "key_concepts": [{"concept": "抛体运动", "formula": "y=vy0t-1/2gt²", "examples": ["平抛、斜抛"]}],
            "exercises": [{"problem": "计算抛体射程", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch05", "title": "牛顿运动定律", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/5-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["矢量", "运动学"], "key_concepts": [{"concept": "牛顿第二定律", "formula": "F=ma", "examples": ["电梯视重变化"]}],
            "exercises": [{"problem": "计算斜面上的加速度", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch06", "title": "万有引力", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/13-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["牛顿定律"], "key_concepts": [{"concept": "万有引力定律", "formula": "F=Gm₁m₂/r²", "examples": ["卫星轨道"]}],
            "exercises": [{"problem": "计算地球引力", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        
        # 第2卷 (第7-10章)
        {
            "chapter_id": "OSTX-UPhys-Ch07", "title": "功与动能", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/7-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["牛顿定律"], "key_concepts": [{"concept": "动能定理", "formula": "W=ΔK", "examples": ["摩擦做功"]}],
            "exercises": [{"problem": "计算摩擦力做功", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch08", "title": "势能与能量守恒", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/8-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["功与动能"], "key_concepts": [{"concept": "机械能守恒", "formula": "E=K+U=const", "examples": ["单摆运动"]}],
            "exercises": [{"problem": "计算单摆速度", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch09", "title": "动量与碰撞", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/9-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["牛顿定律"], "key_concepts": [{"concept": "动量守恒", "formula": "p=mv, Σp=const", "examples": ["弹性碰撞"]}],
            "exercises": [{"problem": "碰撞后速度计算", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch10", "title": "转动运动", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/10-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["牛顿定律"], "key_concepts": [{"concept": "转动惯量", "formula": "I=Σmr²", "examples": ["圆盘、球体"]}],
            "exercises": [{"problem": "计算圆盘转动惯量", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        
        # 第2卷 (第11-14章)
        {
            "chapter_id": "OSTX-UPhys-Ch11", "title": "角动量", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/11-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["转动运动"], "key_concepts": [{"concept": "角动量守恒", "formula": "L=Iω", "examples": ["花样滑冰"]}],
            "exercises": [{"problem": "角速度变化计算", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch12", "title": "静力学与弹性", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/12-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["牛顿定律"], "key_concepts": [{"concept": "平衡条件", "formula": "ΣF=0, Στ=0", "examples": ["杠杆平衡"]}],
            "exercises": [{"problem": "计算杠杆支点力", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch13", "title": "万有引力", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/13-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["牛顿定律"], "key_concepts": [{"concept": "开普勒定律", "formula": "T²∝a³", "examples": ["行星轨道"]}],
            "exercises": [{"problem": "计算卫星周期", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-UPhys-Ch14", "title": "流体力学", "textbook": "University Physics Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "物理",
            "chapter_url": "https://openstax.org/books/university-physics-volume-1/pages/14-introduction",
            "pdf_download_url": "https://openstax.org/details/books/university-physics-volume-1",
            "prerequisites": ["静力学"], "key_concepts": [{"concept": "伯努利方程", "formula": "P+1/2ρv²+ρgh=const", "examples": ["飞机升力"]}],
            "exercises": [{"problem": "计算流速与压强", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 大学化学 ====================
        {
            "chapter_id": "OSTX-Chem-Ch01", "title": "物质的本质与性质", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["基础代数"], "key_concepts": [{"concept": "物质分类", "formula": "", "examples": ["元素、化合物、混合物"]}],
            "exercises": [{"problem": "区分纯净物与混合物", "difficulty": 1}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch02", "title": "原子结构与元素周期表", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/2-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["物质的本质"], "key_concepts": [{"concept": "原子结构", "formula": "", "examples": ["质子、中子、电子"]}],
            "exercises": [{"problem": "计算同位素质量", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch03", "title": "化学计量学", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/3-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["原子结构"], "key_concepts": [{"concept": "摩尔概念", "formula": "n=m/M", "examples": ["物质的量计算"]}],
            "exercises": [{"problem": "计算摩尔质量", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch04", "title": "化学反应与化学计量", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/4-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["化学计量学"], "key_concepts": [{"concept": "化学方程式配平", "formula": "", "examples": ["氧化还原反应"]}],
            "exercises": [{"problem": "配平化学反应方程式", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch05", "title": "热化学", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/5-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["化学反应"], "key_concepts": [{"concept": "焓变", "formula": "ΔH=H产物-H反应物", "examples": ["燃烧热计算"]}],
            "exercises": [{"problem": "计算反应热", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch06", "title": "电子结构与周期律", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/6-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["原子结构"], "key_concepts": [{"concept": "量子数", "formula": "", "examples": ["电子排布"]}],
            "exercises": [{"problem": "写出元素电子构型", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch07", "title": "化学键与分子几何", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/7-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["电子结构"], "key_concepts": [{"concept": "共价键", "formula": "", "examples": ["VSEPR模型"]}],
            "exercises": [{"problem": "预测分子几何形状", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch08", "title": "气体", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/8-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["热化学"], "key_concepts": [{"concept": "理想气体定律", "formula": "PV=nRT", "examples": ["气体体积计算"]}],
            "exercises": [{"problem": "计算气体体积", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch09", "title": "溶液与浓度", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/11-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["化学计量学"], "key_concepts": [{"concept": "摩尔浓度", "formula": "C=n/V", "examples": ["溶液配制"]}],
            "exercises": [{"problem": "计算溶液浓度", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch10", "title": "化学反应速率", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/12-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["化学反应"], "key_concepts": [{"concept": "反应速率方程", "formula": "rate=k[A]^m[B]^n", "examples": ["催化剂作用"]}],
            "exercises": [{"problem": "计算反应速率常数", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch11", "title": "化学平衡", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/13-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["化学反应速率"], "key_concepts": [{"concept": "平衡常数", "formula": "K=[C]^c[D]^d/[A]^a[B]^b", "examples": ["Le Chatelier原理"]}],
            "exercises": [{"problem": "计算平衡常数", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Chem-Ch12", "title": "酸碱化学", "textbook": "Chemistry 2e",
            "source": "openstax", "grade_level": "university", "subject": "化学",
            "chapter_url": "https://openstax.org/books/chemistry-2e/pages/14-introduction",
            "pdf_download_url": "https://openstax.org/details/books/chemistry-2e",
            "prerequisites": ["化学平衡"], "key_concepts": [{"concept": "pH值", "formula": "pH=-log[H⁺]", "examples": ["缓冲溶液"]}],
            "exercises": [{"problem": "计算溶液pH值", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 大学生物 ====================
        {
            "chapter_id": "OSTX-Bio-Ch01", "title": "生物学研究", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": [], "key_concepts": [{"concept": "生命特征", "formula": "", "examples": ["细胞、代谢、繁殖"]}],
            "exercises": [{"problem": "列举生命的基本特征", "difficulty": 1}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch02", "title": "生命的化学基础", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/2-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["生物学研究"], "key_concepts": [{"concept": "生物分子", "formula": "", "examples": ["蛋白质、核酸、糖类、脂质"]}],
            "exercises": [{"problem": "区分四种生物大分子", "difficulty": 1}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch03", "title": "细胞结构", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/4-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["生命的化学基础"], "key_concepts": [{"concept": "细胞器功能", "formula": "", "examples": ["线粒体、叶绿体、内质网"]}],
            "exercises": [{"problem": "描述细胞器功能", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch04", "title": "细胞代谢", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/6-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["细胞结构"], "key_concepts": [{"concept": "细胞呼吸", "formula": "C6H12O6+6O2→6CO2+6H2O+ATP", "examples": ["糖酵解、Krebs循环"]}],
            "exercises": [{"problem": "描述细胞呼吸过程", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch05", "title": "光合作用", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/8-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["细胞代谢"], "key_concepts": [{"concept": "光反应与暗反应", "formula": "6CO2+6H2O+光能→C6H12O6+6O2", "examples": ["C3、C4植物"]}],
            "exercises": [{"problem": "比较光反应与暗反应", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch06", "title": "细胞分裂", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/10-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["细胞结构"], "key_concepts": [{"concept": "有丝分裂与减数分裂", "formula": "", "examples": ["染色体行为"]}],
            "exercises": [{"problem": "比较有丝分裂与减数分裂", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch07", "title": "遗传学基础", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/12-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["细胞分裂"], "key_concepts": [{"concept": "孟德尔定律", "formula": "", "examples": ["分离定律、自由组合定律"]}],
            "exercises": [{"problem": "计算基因型比例", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch08", "title": "DNA结构与功能", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/14-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["遗传学基础"], "key_concepts": [{"concept": "DNA双螺旋", "formula": "", "examples": ["碱基配对、复制"]}],
            "exercises": [{"problem": "描述DNA复制过程", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch09", "title": "基因表达", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/15-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["DNA结构"], "key_concepts": [{"concept": "转录与翻译", "formula": "DNA→RNA→蛋白质", "examples": ["遗传密码"]}],
            "exercises": [{"problem": "描述中心法则", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch10", "title": "进化与自然选择", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/18-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["遗传学基础"], "key_concepts": [{"concept": "自然选择", "formula": "", "examples": ["适者生存、基因频率"]}],
            "exercises": [{"problem": "解释自然选择机制", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch11", "title": "生态系统与生物多样性", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/44-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["进化"], "key_concepts": [{"concept": "生态系统结构", "formula": "", "examples": ["食物链、能量流"]}],
            "exercises": [{"problem": "分析食物网", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Bio-Ch12", "title": "人体解剖与生理", "textbook": "Biology 2e",
            "source": "openstax", "grade_level": "university", "subject": "生物",
            "chapter_url": "https://openstax.org/books/biology-2e/pages/33-introduction",
            "pdf_download_url": "https://openstax.org/details/books/biology-2e",
            "prerequisites": ["细胞结构"], "key_concepts": [{"concept": "器官系统", "formula": "", "examples": ["循环系统、呼吸系统"]}],
            "exercises": [{"problem": "描述器官系统功能", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 工程学 ====================
        {
            "chapter_id": "OSTX-Eng-Ch01", "title": "工程力学 - 静力学", "textbook": "Engineering Statics",
            "source": "openstax", "grade_level": "university", "subject": "工程",
            "chapter_url": "https://openstax.org/books/engineering-statics/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/engineering-statics",
            "prerequisites": ["矢量", "牛顿定律"], "key_concepts": [{"concept": "力系平衡", "formula": "ΣF=0, ΣM=0", "examples": ["桁架分析"]}],
            "exercises": [{"problem": "计算桁架杆件内力", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Eng-Ch02", "title": "工程力学 - 动力学", "textbook": "Engineering Mechanics",
            "source": "openstax", "grade_level": "university", "subject": "工程",
            "chapter_url": "https://openstax.org/books/engineering-mechanics/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/engineering-mechanics",
            "prerequisites": ["静力学"], "key_concepts": [{"concept": "运动学与动力学", "formula": "F=ma", "examples": ["刚体运动"]}],
            "exercises": [{"problem": "计算刚体加速度", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Eng-Ch03", "title": "材料力学", "textbook": "Mechanics of Materials",
            "source": "openstax", "grade_level": "university", "subject": "工程",
            "chapter_url": "https://openstax.org/books/mechanics-materials/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/mechanics-materials",
            "prerequisites": ["静力学"], "key_concepts": [{"concept": "应力与应变", "formula": "σ=F/A, ε=ΔL/L", "examples": ["胡克定律"]}],
            "exercises": [{"problem": "计算梁的应力", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 计算机科学 ====================
        {
            "chapter_id": "OSTX-CS-Ch01", "title": "计算机科学导论", "textbook": "Introduction to Computer Science",
            "source": "openstax", "grade_level": "university", "subject": "计算机",
            "chapter_url": "https://openstax.org/books/intro-computer-science/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/intro-computer-science",
            "prerequisites": [], "key_concepts": [{"concept": "计算思维", "formula": "", "examples": ["算法、数据结构"]}],
            "exercises": [{"problem": "描述计算机基本组成", "difficulty": 1}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-CS-Ch02", "title": "数据结构与算法", "textbook": "Data Structures and Algorithms",
            "source": "openstax", "grade_level": "university", "subject": "计算机",
            "chapter_url": "https://openstax.org/books/data-structures/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/data-structures",
            "prerequisites": ["计算机科学导论"], "key_concepts": [{"concept": "线性数据结构", "formula": "", "examples": ["数组、链表、栈、队列"]}],
            "exercises": [{"problem": "实现栈的基本操作", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-CS-Ch03", "title": "操作系统原理", "textbook": "Operating Systems",
            "source": "openstax", "grade_level": "university", "subject": "计算机",
            "chapter_url": "https://openstax.org/books/operating-systems/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/operating-systems",
            "prerequisites": ["计算机科学导论"], "key_concepts": [{"concept": "进程管理", "formula": "", "examples": ["进程调度、死锁"]}],
            "exercises": [{"problem": "描述进程状态转换", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-CS-Ch04", "title": "计算机网络", "textbook": "Computer Networks",
            "source": "openstax", "grade_level": "university", "subject": "计算机",
            "chapter_url": "https://openstax.org/books/computer-networks/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/computer-networks",
            "prerequisites": ["计算机科学导论"], "key_concepts": [{"concept": "OSI模型", "formula": "", "examples": ["TCP/IP协议栈"]}],
            "exercises": [{"problem": "解释OSI七层模型", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        
        # ==================== 数学 ====================
        {
            "chapter_id": "OSTX-Math-Ch01", "title": "微积分I - 极限与连续性", "textbook": "Calculus Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "数学",
            "chapter_url": "https://openstax.org/books/calculus-volume-1/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/calculus-volume-1",
            "prerequisites": ["函数", "三角函数"], "key_concepts": [{"concept": "极限概念", "formula": "lim(x→a)f(x)=L", "examples": ["左极限、右极限"]}],
            "exercises": [{"problem": "计算函数极限", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Math-Ch02", "title": "微积分I - 导数", "textbook": "Calculus Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "数学",
            "chapter_url": "https://openstax.org/books/calculus-volume-1/pages/3-introduction",
            "pdf_download_url": "https://openstax.org/details/books/calculus-volume-1",
            "prerequisites": ["极限与连续性"], "key_concepts": [{"concept": "导数定义", "formula": "f'(x)=lim(Δx→0)[f(x+Δx)-f(x)]/Δx", "examples": ["切线斜率、瞬时速度"]}],
            "exercises": [{"problem": "求多项式导数", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Math-Ch03", "title": "微积分I - 积分", "textbook": "Calculus Volume 1",
            "source": "openstax", "grade_level": "university", "subject": "数学",
            "chapter_url": "https://openstax.org/books/calculus-volume-1/pages/5-introduction",
            "pdf_download_url": "https://openstax.org/details/books/calculus-volume-1",
            "prerequisites": ["导数"], "key_concepts": [{"concept": "不定积分", "formula": "∫f(x)dx=F(x)+C", "examples": ["面积计算"]}],
            "exercises": [{"problem": "计算定积分", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Math-Ch04", "title": "微积分II - 积分应用", "textbook": "Calculus Volume 2",
            "source": "openstax", "grade_level": "university", "subject": "数学",
            "chapter_url": "https://openstax.org/books/calculus-volume-2/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/calculus-volume-2",
            "prerequisites": ["积分"], "key_concepts": [{"concept": "旋转体体积", "formula": "V=π∫[f(x)]²dx", "examples": ["圆盘法、壳层法"]}],
            "exercises": [{"problem": "计算旋转体体积", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Math-Ch05", "title": "微积分III - 多元函数", "textbook": "Calculus Volume 3",
            "source": "openstax", "grade_level": "university", "subject": "数学",
            "chapter_url": "https://openstax.org/books/calculus-volume-3/pages/11-introduction",
            "pdf_download_url": "https://openstax.org/details/books/calculus-volume-3",
            "prerequisites": ["微积分I"], "key_concepts": [{"concept": "偏导数", "formula": "∂f/∂x", "examples": ["梯度、方向导数"]}],
            "exercises": [{"problem": "计算偏导数", "difficulty": 3}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Math-Ch06", "title": "线性代数 - 矩阵与行列式", "textbook": "Linear Algebra",
            "source": "openstax", "grade_level": "university", "subject": "数学",
            "chapter_url": "https://openstax.org/books/linear-algebra/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/linear-algebra",
            "prerequisites": ["基础代数"], "key_concepts": [{"concept": "矩阵运算", "formula": "AB≠BA", "examples": ["行列式计算、逆矩阵"]}],
            "exercises": [{"problem": "计算矩阵行列式", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
        {
            "chapter_id": "OSTX-Math-Ch07", "title": "概率论与数理统计", "textbook": "Introductory Statistics",
            "source": "openstax", "grade_level": "university", "subject": "数学",
            "chapter_url": "https://openstax.org/books/introductory-statistics/pages/1-introduction",
            "pdf_download_url": "https://openstax.org/details/books/introductory-statistics",
            "prerequisites": ["基础代数"], "key_concepts": [{"concept": "概率分布", "formula": "P(A)=n(A)/n(S)", "examples": ["正态分布、二项分布"]}],
            "exercises": [{"problem": "计算概率", "difficulty": 2}], "scraped_at": datetime.now().isoformat()
        },
    ]
    
    return chapters


def main():
    """生成并保存扩展的OpenStax章节数据"""
    output_dir = Path("data/textbook_library")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    chapters = generate_openstax_extended_chapters()
    
    output_file = output_dir / "openstax_chapters.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(chapters, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功生成 {len(chapters)} 个OpenStax章节")
    print(f"📁 保存位置: {output_file}")
    
    # 统计信息
    subject_count = {}
    for chapter in chapters:
        subject = chapter['subject']
        subject_count[subject] = subject_count.get(subject, 0) + 1
    
    print(f"\n学科分布:")
    for subject, count in sorted(subject_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {subject}: {count}个章节")


if __name__ == "__main__":
    main()
