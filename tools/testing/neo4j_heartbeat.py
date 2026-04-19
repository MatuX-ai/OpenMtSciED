"""
Neo4j心跳保持脚本 - 防止Aura实例自动暂停
每30分钟发送一次查询，保持实例活跃
"""
import os
import time
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def send_heartbeat():
    """发送心跳查询"""
    query_api_url = os.getenv("NEO4J_QUERY_API_URL")
    user = os.getenv("NEO4J_USER")
    password = os.getenv("NEO4J_PASSWORD")
    
    if not all([query_api_url, user, password]):
        print("❌ 缺少环境变量配置")
        return False
    
    try:
        query = "RETURN timestamp() AS heartbeat"
        payload = {"statements": [{"statement": query}]}
        
        response = requests.post(
            query_api_url,
            json=payload,
            auth=(user, password),
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] 心跳成功")
            return True
        else:
            print(f"⚠️  [{datetime.now().strftime('%H:%M:%S')}] 心跳失败: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ [{datetime.now().strftime('%H:%M:%S')}] 心跳异常: {e}")
        return False

def main():
    """主循环 - 每30分钟发送一次心跳"""
    interval_minutes = 30
    interval_seconds = interval_minutes * 60
    
    print(f"🔄 Neo4j心跳保持服务启动")
    print(f"   间隔: {interval_minutes} 分钟")
    print(f"   按 Ctrl+C 停止\n")
    
    # 立即发送第一次心跳
    send_heartbeat()
    
    try:
        while True:
            time.sleep(interval_seconds)
            send_heartbeat()
    except KeyboardInterrupt:
        print("\n\n👋 心跳服务已停止")

if __name__ == "__main__":
    main()
