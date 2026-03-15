import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ViewChild, 
  ElementRef, 
  OnInit, 
  OnDestroy,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CodeCompletionService, CompletionSuggestion } from '../services/code-completion.service';
import { EditorContextService } from '../services/editor-context.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-smart-editor',
  template: `
    <div class="smart-editor-container" [class.disabled]="disabled">
      <!-- 编辑器头部 -->
      <div class="editor-header" *ngIf="showHeader">
        <div class="editor-info">
          <span class="language-indicator">{{ language }}</span>
          <span class="line-count">行 {{ lineCount }}</span>
          <span class="column-indicator">列 {{ column }}</span>
        </div>
        <div class="editor-actions">
          <button 
            class="btn btn-sm" 
            [disabled]="disabled"
            (click)="triggerCompletion()"
            title="触发代码补全 (Ctrl+Space)">
            💡 补全
          </button>
          <button 
            class="btn btn-sm" 
            [disabled]="disabled"
            (click)="formatCode()"
            title="格式化代码">
            🎨 格式化
          </button>
        </div>
      </div>

      <!-- 主编辑区域 -->
      <div class="editor-wrapper">
        <textarea
          #editorTextarea
          class="editor-textarea"
          [value]="value"
          [disabled]="disabled"
          [placeholder]="placeholder"
          (input)="onInput($event)"
          (keydown)="onKeyDown($event)"
          (keyup)="onKeyUp($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (scroll)="onScroll($event)">
        </textarea>

        <!-- 补全建议面板 -->
        <div 
          class="completion-panel" 
          *ngIf="showCompletion && filteredSuggestions.length > 0"
          [style.top.px]="completionPosition.top"
          [style.left.px]="completionPosition.left">
          <div class="completion-header">
            <span>💡 代码补全 ({{ filteredSuggestions.length }})</span>
            <button class="close-btn" (click)="hideCompletion()">&times;</button>
          </div>
          <div class="suggestions-list">
            <div
              *ngFor="let suggestion of filteredSuggestions; let i = index"
              class="suggestion-item"
              [class.active]="i === selectedIndex"
              (mouseenter)="selectSuggestion(i)"
              (click)="applySuggestion(suggestion)">
              <div class="suggestion-text">{{ suggestion.text }}</div>
              <div class="suggestion-meta">
                <span class="confidence">{{ (suggestion.confidence * 100).toFixed(0) }}%</span>
                <span class="features" *ngIf="suggestion.languageFeatures.length > 0">
                  {{ suggestion.languageFeatures.join(', ') }}
                </span>
              </div>
            </div>
          </div>
          <div class="completion-footer">
            <small>↑↓ 选择  ⏎ 应用  Esc 关闭</small>
          </div>
        </div>

        <!-- 加载指示器 -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="spinner"></div>
          <span>正在生成补全建议...</span>
        </div>
      </div>

      <!-- 状态栏 -->
      <div class="editor-status" *ngIf="showStatus">
        <div class="status-left">
          <span *ngIf="lastCompletionTime" class="timing-info">
            ⏱ {{ lastCompletionTime }}ms
          </span>
          <span *ngIf="currentModel" class="model-info">
            🤖 {{ currentModel }}
          </span>
        </div>
        <div class="status-right">
          <span class="connection-status" [class.connected]="isConnected">
            {{ isConnected ? '🟢 在线' : '🔴 离线' }}
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./smart-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SmartEditorComponent),
      multi: true
    }
  ]
})
export class SmartEditorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() language: string = 'python';
  @Input() placeholder: string = '开始编写代码...';
  @Input() disabled: boolean = false;
  @Input() showHeader: boolean = true;
  @Input() showStatus: boolean = true;
  @Input() autoCompletion: boolean = true;
  @Input() completionDelay: number = 300; // 毫秒
  @Input() minPrefixLength: number = 3;
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() completionTriggered = new EventEmitter<void>();
  @Output() suggestionApplied = new EventEmitter<CompletionSuggestion>();

  @ViewChild('editorTextarea') textarea!: ElementRef<HTMLTextAreaElement>;

  value: string = '';
  isLoading: boolean = false;
  showCompletion: boolean = false;
  suggestions: CompletionSuggestion[] = [];
  filteredSuggestions: CompletionSuggestion[] = [];
  selectedIndex: number = 0;
  completionPosition: { top: number; left: number } = { top: 0, left: 0 };
  lineCount: number = 1;
  column: number = 1;
  lastCompletionTime: number = 0;
  currentModel: string = '';
  isConnected: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private completionTimeout: any;
  private subscriptions: Subscription[] = [];

  constructor(
    private completionService: CodeCompletionService,
    private contextService: EditorContextService
  ) {}

  ngOnInit() {
    // 订阅WebSocket状态
    this.subscriptions.push(
      this.completionService.connectWebSocket().subscribe((message: any) => {
        if (message?.type === 'connected') {
          this.isConnected = true;
        } else if (message?.type === 'disconnected') {
          this.isConnected = false;
        } else if (message?.type === 'completion_response') {
          this.handleCompletionResponse(message.data);
        }
      })
    );

    // 初始化上下文服务
    this.contextService.initialize(this.language);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.completionService.disconnectWebSocket();
    if (this.completionTimeout) {
      clearTimeout(this.completionTimeout);
    }
  }

  // ControlValueAccessor 实现
  writeValue(value: string): void {
    this.value = value || '';
    this.updateLineColumn();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // 事件处理器
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.updateLineColumn();
    
    // 触发自动补全
    if (this.autoCompletion && !this.disabled) {
      this.scheduleCompletion();
    }

    // 更新上下文
    this.contextService.updateContext(this.value, this.getCaretPosition());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showCompletion) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.selectPreviousSuggestion();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.selectNextSuggestion();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.filteredSuggestions[this.selectedIndex]) {
          this.applySuggestion(this.filteredSuggestions[this.selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.hideCompletion();
        break;
      case ' ':
        if (event.ctrlKey) {
          event.preventDefault();
          this.triggerCompletion();
        }
        break;
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    // 处理普通按键后的逻辑
    if (!['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
      this.filterSuggestions();
    }
  }

  onFocus(): void {
    this.onTouched();
  }

  onBlur(): void {
    // 延迟隐藏补全面板，允许点击建议
    setTimeout(() => {
      if (this.showCompletion) {
        this.hideCompletion();
      }
    }, 200);
  }

  onScroll(event: Event): void {
    // 滚动时更新补全面板位置
    if (this.showCompletion) {
      this.calculateCompletionPosition();
    }
  }

  // 补全相关方法
  triggerCompletion(): void {
    if (this.disabled) return;
    
    this.completionTriggered.emit();
    this.requestCompletion();
  }

  private scheduleCompletion(): void {
    if (this.completionTimeout) {
      clearTimeout(this.completionTimeout);
    }

    this.completionTimeout = setTimeout(() => {
      const prefix = this.getCurrentPrefix();
      if (prefix.length >= this.minPrefixLength) {
        this.requestCompletion();
      }
    }, this.completionDelay);
  }

  private requestCompletion(): void {
    const prefix = this.getCurrentPrefix();
    const context = this.getContextLines();
    
    if (prefix.length < this.minPrefixLength) {
      this.hideCompletion();
      return;
    }

    this.isLoading = true;
    this.showCompletion = true;
    this.calculateCompletionPosition();

    // 使用WebSocket如果连接可用，否则使用HTTP
    if (this.isConnected) {
      this.completionService.sendCompletionRequest({
        prefix,
        context,
        language: this.language,
        maxSuggestions: 10
      });
    } else {
      this.completionService.getSuggestions({
        prefix,
        context,
        language: this.language,
        maxSuggestions: 10
      }).subscribe((response: any) => {
        this.handleCompletionResponse(response);
      });
    }
  }

  private handleCompletionResponse(response: any): void {
    this.isLoading = false;
    this.lastCompletionTime = Math.round(response.processingTime * 1000);
    this.currentModel = response.modelUsed;
    
    this.suggestions = this.completionService.sortSuggestions(
      this.completionService.filterSuggestions(response.suggestions, 0.6)
    );
    
    this.filteredSuggestions = [...this.suggestions];
    this.selectedIndex = 0;
    
    if (this.suggestions.length === 0) {
      this.hideCompletion();
    }
  }

  private getCurrentPrefix(): string {
    const caretPos = this.getCaretPosition();
    const textBeforeCaret = this.value.substring(0, caretPos);
    
    // 简单的前缀提取（从最后一个空白字符开始）
    const lastSpaceIndex = Math.max(
      textBeforeCaret.lastIndexOf(' '),
      textBeforeCaret.lastIndexOf('\n'),
      textBeforeCaret.lastIndexOf('\t')
    );
    
    return textBeforeCaret.substring(lastSpaceIndex + 1);
  }

  private getContextLines(): string[] {
    const lines = this.value.split('\n');
    const currentLine = this.getCurrentLineIndex();
    const startLine = Math.max(0, currentLine - 10);
    return lines.slice(startLine, currentLine + 1);
  }

  private getCaretPosition(): number {
    return this.textarea?.nativeElement?.selectionStart || 0;
  }

  private getCurrentLineIndex(): number {
    const caretPos = this.getCaretPosition();
    const textBeforeCaret = this.value.substring(0, caretPos);
    return textBeforeCaret.split('\n').length - 1;
  }

  private calculateCompletionPosition(): void {
    if (!this.textarea) return;
    
    const textarea = this.textarea.nativeElement;
    const caretPos = this.getCaretPosition();
    
    // 创建临时元素来测量位置
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.wordWrap = 'break-word';
    tempDiv.style.width = textarea.offsetWidth + 'px';
    tempDiv.style.font = window.getComputedStyle(textarea).font;
    tempDiv.style.padding = window.getComputedStyle(textarea).padding;
    
    // 复制文本直到光标位置
    const textUpToCaret = this.value.substring(0, caretPos);
    tempDiv.textContent = textUpToCaret;
    
    document.body.appendChild(tempDiv);
    
    const rect = textarea.getBoundingClientRect();
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    
    this.completionPosition = {
      top: rect.top + tempDiv.offsetHeight - scrollTop + 20,
      left: rect.left - scrollLeft
    };
    
    document.body.removeChild(tempDiv);
  }

  private filterSuggestions(): void {
    const prefix = this.getCurrentPrefix().toLowerCase();
    this.filteredSuggestions = this.suggestions.filter(suggestion =>
      suggestion.text.toLowerCase().startsWith(prefix)
    );
    this.selectedIndex = 0;
  }

  private selectSuggestion(index: number): void {
    this.selectedIndex = index;
  }

  private selectPreviousSuggestion(): void {
    this.selectedIndex = this.selectedIndex > 0 
      ? this.selectedIndex - 1 
      : this.filteredSuggestions.length - 1;
  }

  private selectNextSuggestion(): void {
    this.selectedIndex = this.selectedIndex < this.filteredSuggestions.length - 1
      ? this.selectedIndex + 1
      : 0;
  }

  private applySuggestion(suggestion: CompletionSuggestion): void {
    const caretPos = this.getCaretPosition();
    const prefix = this.getCurrentPrefix();
    const prefixStart = caretPos - prefix.length;
    
    // 替换前缀为完整的建议
    const newValue = this.value.substring(0, prefixStart) + 
                     suggestion.text + 
                     this.value.substring(caretPos);
    
    this.value = newValue;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    
    // 移动光标到补全过程末尾
    setTimeout(() => {
      const newCaretPos = prefixStart + suggestion.text.length;
      this.textarea.nativeElement.setSelectionRange(newCaretPos, newCaretPos);
    });
    
    this.hideCompletion();
    this.suggestionApplied.emit(suggestion);
  }

  private hideCompletion(): void {
    this.showCompletion = false;
    this.suggestions = [];
    this.filteredSuggestions = [];
    this.selectedIndex = 0;
  }

  private updateLineColumn(): void {
    const caretPos = this.getCaretPosition();
    const textBeforeCaret = this.value.substring(0, caretPos);
    const lines = textBeforeCaret.split('\n');
    
    this.lineCount = this.value.split('\n').length;
    this.column = lines[lines.length - 1].length + 1;
  }

  // 公共方法
  formatCode(): void {
    // 简单的代码格式化实现
    // 实际项目中可能需要集成专门的格式化工具
    console.log('格式化代码功能待实现');
  }

  clear(): void {
    this.value = '';
    this.onChange('');
    this.valueChange.emit('');
    this.updateLineColumn();
  }

  focus(): void {
    this.textarea?.nativeElement?.focus();
  }

  insertText(text: string): void {
    const caretPos = this.getCaretPosition();
    const newValue = this.value.substring(0, caretPos) + 
                     text + 
                     this.value.substring(caretPos);
    
    this.value = newValue;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    
    // 更新光标位置
    setTimeout(() => {
      const newCaretPos = caretPos + text.length;
      this.textarea.nativeElement.setSelectionRange(newCaretPos, newCaretPos);
    });
  }
}