import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private statusSubject = new BehaviorSubject<NetworkStatus>({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });

  public status$: Observable<NetworkStatus> = this.statusSubject.asObservable();

  constructor() {
    // 监听浏览器在线/离线事件
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateStatus(true));
      window.addEventListener('offline', () => this.updateStatus(false));
    }
  }

  /**
   * 获取当前网络状态
   */
  getStatus(): NetworkStatus {
    return this.statusSubject.getValue();
  }

  /**
   * 检查是否在线
   */
  isOnline(): boolean {
    return this.statusSubject.getValue().isOnline;
  }

  /**
   * 手动检查网络状态
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      // 尝试访问一个可靠的URL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);
      
      const isOnline = response.type === 'opaque' || response.ok;
      this.updateStatus(isOnline);
      return isOnline;
    } catch (error) {
      this.updateStatus(false);
      return false;
    }
  }

  /**
   * 更新状态
   */
  private updateStatus(isOnline: boolean): void {
    this.statusSubject.next({
      isOnline,
      lastChecked: new Date()
    });
  }
}
