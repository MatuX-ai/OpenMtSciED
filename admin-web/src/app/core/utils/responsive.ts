/**
 * 响应式断点工具
 * 提供移动端/平板/桌面三档断点常量与视口检测函数
 * 移动端断点：< 768px（与 admin-layout 中 @media 一致）
 * 平板断点：< 1024px
 */

/** 响应式断点常量（像素） */
export const BREAKPOINTS = {
  /** 移动端上限 */
  mobile: 768,
  /** 平板上限 */
  tablet: 1024,
} as const;

/** 断点区间类型 */
export type BreakpointCategory = 'mobile' | 'tablet' | 'desktop';

/**
 * 判断当前视口是否为移动端（< 768px）
 * @param width 视口宽度（可选，默认读取 window.innerWidth）
 * @returns true 表示移动端
 */
export function isMobileViewport(width?: number): boolean {
  const w = width ?? getViewportWidth();
  return w < BREAKPOINTS.mobile;
}

/**
 * 判断当前视口是否为平板（768px - 1024px）
 * @param width 视口宽度（可选）
 * @returns true 表示平板
 */
export function isTabletViewport(width?: number): boolean {
  const w = width ?? getViewportWidth();
  return w >= BREAKPOINTS.mobile && w < BREAKPOINTS.tablet;
}

/**
 * 判断当前视口是否为桌面端（>= 1024px）
 * @param width 视口宽度（可选）
 * @returns true 表示桌面端
 */
export function isDesktopViewport(width?: number): boolean {
  const w = width ?? getViewportWidth();
  return w >= BREAKPOINTS.tablet;
}

/**
 * 获取当前视口宽度
 * 在 SSR / window 不可用时返回 Number.MAX_SAFE_INTEGER（视为桌面端）
 */
export function getViewportWidth(): number {
  if (typeof window === 'undefined') {
    return Number.MAX_SAFE_INTEGER;
  }
  return window.innerWidth;
}

/**
 * 根据宽度返回断点区间分类
 * @param width 视口宽度
 */
export function getBreakpointCategory(width?: number): BreakpointCategory {
  const w = width ?? getViewportWidth();
  if (w < BREAKPOINTS.mobile) return 'mobile';
  if (w < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

/**
 * 订阅视口变化，回调返回当前是否为移动端
 * @param callback 视口变化回调（参数：当前是否为移动端）
 * @returns 取消订阅函数
 */
export function subscribeViewportChanges(callback: (isMobile: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  // 立即触发一次，回调当前状态
  callback(isMobileViewport());

  // 仅在 window 支持 matchMedia 时才监听
  const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile - 1}px)`);
  const handler = (event: MediaQueryListEvent | MediaQueryList): void => {
    callback(event.matches);
  };

  // 现代浏览器使用 addEventListener，旧浏览器回退到 addListener
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }

  // 兼容旧 API
  const legacyMql = mql as unknown as {
    addListener: (cb: (ev: MediaQueryListEvent) => void) => void;
    removeListener: (cb: (ev: MediaQueryListEvent) => void) => void;
  };
  legacyMql.addListener(handler);
  return () => legacyMql.removeListener(handler);
}