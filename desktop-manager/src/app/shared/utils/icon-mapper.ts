/**
 * 图标映射工具
 * 统一将 Material Icons 名称映射到 RemixIcon 名称
 *
 * 使用方法：
 * ```typescript
 * import { IconMapper } from '../../shared/utils/icon-mapper';
 *
 * // 在模板中
 * <i [class]="IconMapper.toRemix('search_off')"></i>
 *
 * // 在代码中
 * const iconClass = IconMapper.toRemix('add_circle_outline');
 * ```
 */

export const ICON_MAPPING: Record<string, string> = {
  // 基础导航
  'folder': 'ri-folder-line',
  'folder_open': 'ri-folder-open-line',
  'folder_special': 'ri-star-line',
  'create_new_folder': 'ri-folder-add-line',
  'menu_book': 'ri-book-2-line',
  'book': 'ri-book-line',
  'description': 'ri-file-list-line',
  'memory': 'ri-cpu-line',
  'storage': 'ri-database-line',

  // 箭头
  'arrow_forward': 'ri-arrow-right-line',
  'arrow_back': 'ri-arrow-left-line',

  // 添加/创建
  'add': 'ri-add-line',
  'add_circle_outline': 'ri-add-circle-line',

  // 编辑/删除
  'edit': 'ri-edit-line',
  'delete': 'ri-delete-bin-line',
  'delete_sweep': 'ri-delete-bin-line',

  // 操作
  'undo': 'ri-arrow-go-back-line',
  'redo': 'ri-arrow-go-forward-line',
  'copy': 'ri-file-copy-line',
  'content_copy': 'ri-file-copy-line',
  'save': 'ri-save-line',
  'upload': 'ri-upload-line',
  'download': 'ri-download-line',
  'cloud_upload': 'ri-cloud-upload-line',

  // 媒体控制
  'play_arrow': 'ri-play-line',
  'refresh': 'ri-refresh-line',
  'restore': 'ri-restart-line',
  'restart': 'ri-restart-line',
  'settings_backup_restore': 'ri-restart-line',
  'import_export': 'ri-exchange-line',
  'backup': 'ri-save-line',

  // 搜索
  'search': 'ri-search-line',
  'search_off': 'ri-file-search-line',
  'filter_list': 'ri-filter-line',
  'clear_all': 'ri-delete-bin-2-line',

  // 信息提示
  'info': 'ri-information-line',
  'warning': 'ri-error-warning-line',
  'error_outline': 'ri-error-warning-line',
  'check': 'ri-check-line',
  'check_circle': 'ri-checkbox-circle-line',
  'cancel': 'ri-close-circle-line',
  'close': 'ri-close-line',

  // 时间/标签
  'schedule': 'ri-time-line',
  'label': 'ri-price-tag-3-line',
  'tag': 'ri-price-tag-3-line',
  'inbox': 'ri-inbox-line',

  // 工具/构建
  'build': 'ri-tools-line',
  'list': 'ri-list-unordered',
  'link': 'ri-link-line',
  'code': 'ri-code-line',
  'visibility': 'ri-eye-line',
  'school': 'ri-school-line',
  'send': 'ri-send-plane-line',

  // 状态
  'wifi': 'ri-wifi-line',
  'wifi_off': 'ri-wifi-off-line',
  'light_mode': 'ri-sun-line',
  'dark_mode': 'ri-moon-line',

  // 图表分析
  'insights': 'ri-line-chart-line',
  'analytics': 'ri-bar-chart-line',
  'trending_up': 'ri-line-chart-line',
  'track_changes': 'ri-focus-line',
  'format_list_numbered': 'ri-list-ordered',

  // 主题内容
  'library_books': 'ri-book-shelf-line',
  'psychology': 'ri-bubble-chart-line',
  'lightbulb': 'ri-lightbulb-line',

  // 扩展箭头
  'expand_less': 'ri-arrow-up-s-line',
  'expand_more': 'ri-arrow-down-s-line',
};

export class IconMapper {
  /**
   * 将 Material Icons 名称转换为 RemixIcon 类名
   * @param materialName Material Icons 名称
   * @param fallback 后备图标类名（默认 'ri-question-line'）
   */
  static toRemix(materialName: string, fallback: string = 'ri-question-line'): string {
    return ICON_MAPPING[materialName] || fallback;
  }

  /**
   * 检查是否为已知的 Material Icons 名称
   */
  static isKnown(materialName: string): boolean {
    return materialName in ICON_MAPPING;
  }
}