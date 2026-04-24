import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ShortcutService implements OnDestroy {
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private handler: (event: KeyboardEvent) => void;

  constructor() {
    this.handler = this.handleKeydown.bind(this);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handler);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handler);
    }
    this.shortcuts.clear();
  }

  /**
   * 注册快捷键
   */
  register(config: ShortcutConfig): void {
    const key = this.getShortcutKey(config);
    this.shortcuts.set(key, config);
  }

  /**
   * 注销快捷键
   */
  unregister(key: string): void {
    this.shortcuts.delete(key);
  }

  /**
   * 获取所有已注册的快捷键
   */
  getAllShortcuts(): ShortcutConfig[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * 处理键盘事件
   */
  private handleKeydown(event: KeyboardEvent): void {
    // 忽略输入框中的按键
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // 但允许Esc键
      if (event.key !== 'Escape') {
        return;
      }
    }

    const pressedKey = this.getPressedKey(event);
    const shortcut = this.shortcuts.get(pressedKey);

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }

  /**
   * 生成快捷键标识
   */
  private getShortcutKey(config: ShortcutConfig): string {
    const parts: string[] = [];
    
    if (config.ctrl) parts.push('Ctrl');
    if (config.shift) parts.push('Shift');
    if (config.alt) parts.push('Alt');
    
    parts.push(config.key.toUpperCase());
    
    return parts.join('+');
  }

  /**
   * 获取按下的快捷键标识
   */
  private getPressedKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    parts.push(key);
    
    return parts.join('+');
  }
}
