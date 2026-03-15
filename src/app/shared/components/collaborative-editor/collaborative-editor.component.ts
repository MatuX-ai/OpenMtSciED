import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { CollaborationClient, TextOperation } from './ot-algorithm';

interface DocumentInfo {
  id: number;
  document_name: string;
  content: string;
  version_number: number;
  allow_comments: boolean;
  allow_suggestions: boolean;
}

interface DocumentOperation {
  id: number;
  operation_type: string;
  position: number;
  content: string;
  client_id: string;
  user_id: number;
  timestamp: string;
}

interface DocumentComment {
  id: number;
  start_position: number;
  end_position: number;
  content: string;
  comment_type: string;
  user_name: string;
  is_resolved: boolean;
  created_at: string;
}

interface DocumentSuggestion {
  id: number;
  start_position: number;
  end_position: number;
  original_content: string;
  suggested_content: string;
  user_name: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-collaborative-editor',
  templateUrl: './collaborative-editor.component.html',
  styleUrls: ['./collaborative-editor.component.scss']
})
export class CollaborativeEditorComponent implements OnInit, OnDestroy {
  @Input() courseId!: number;
  @Input() orgId!: number;
  @Input() documentId!: number;
  @Input() userId!: number;
  @Input() userName!: string;
  
  @Output() contentChange = new EventEmitter<string>();
  @Output() documentLoaded = new EventEmitter<DocumentInfo>();
  
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  
  // 编辑器状态
  documentInfo: DocumentInfo | null = null;
  editorContent: string = '';
  isLoading = false;
  isSaving = false;
  isConnected = false;
  
  // 协作功能
  clientId: string = this.generateClientId();
  sessionId: string = '';
  collaborationClient!: CollaborationClient;
  activeUsers: Array<{userId: number, userName: string, cursorPosition: number}> = [];
  currentCursorPosition: number = 0;
  
  // 评论和建议
  showCommentsPanel = false;
  showSuggestionsPanel = false;
  comments: DocumentComment[] = [];
  suggestions: DocumentSuggestion[] = [];
  
  // WebSocket连接
  private ws: WebSocket | null = null;
  private destroy$ = new Subject<void>();
  
  // 操作队列
  private pendingOperations: any[] = [];
  private lastSyncTime = Date.now();
  private syncInterval = 1000; // 1秒同步间隔
  
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDocument();
    this.setupAutoSync();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnectWebSocket();
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  loadDocument(): void {
    if (!this.documentId || !this.orgId || !this.courseId) {
      console.error('缺少必要的参数');
      return;
    }

    this.isLoading = true;
    
    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}`;
    
    this.http.get<DocumentInfo>(url).subscribe({
      next: (data) => {
        this.documentInfo = data;
        this.editorContent = data.content;
        this.contentChange.emit(this.editorContent);
        this.documentLoaded.emit(data);
        this.joinSession();
        this.loadComments();
        this.loadSuggestions();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('加载文档失败:', error);
        this.snackBar.open('加载文档失败', '关闭', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  joinSession(): void {
    if (!this.documentInfo) return;

    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/sessions`;
    
    this.http.post<any>(url, { client_id: this.clientId }).subscribe({
      next: (response) => {
        this.sessionId = response.session_id;
        this.connectWebSocket();
        this.snackBar.open('已加入协作会话', '', { duration: 2000 });
      },
      error: (error) => {
        console.error('加入会话失败:', error);
      }
    });
  }

  connectWebSocket(): void {
    if (!this.documentId || !this.sessionId) return;

    const wsUrl = `ws://localhost:8000/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/ws?session_id=${this.sessionId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket连接已建立');
        this.isConnected = true;
        this.snackBar.open('实时连接已建立', '', { duration: 2000 });
      };
      
      this.ws.onmessage = (event) => {
        this.handleWebSocketMessage(event.data);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        this.isConnected = false;
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.isConnected = false;
      };
      
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.isConnected = false;
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'operations_applied':
          this.applyRemoteOperations(message.operations);
          break;
        case 'comment_added':
          this.addRemoteComment(message.comment);
          break;
        case 'suggestion_added':
          this.addRemoteSuggestion(message.suggestion);
          break;
        case 'cursor_update':
          this.updateRemoteCursor(message);
          break;
        case 'user_left':
          this.removeUser(message.session_id);
          break;
      }
    } catch (error) {
      console.error('处理WebSocket消息失败:', error);
    }
  }

  onContentChange(newContent: string): void {
    const oldContent = this.editorContent;
    this.editorContent = newContent;
    
    // 计算操作差异
    const operations = this.calculateOperations(oldContent, newContent);
    
    if (operations.length > 0) {
      this.pendingOperations.push(...operations);
      this.contentChange.emit(newContent);
    }
  }

  private calculateOperations(oldContent: string, newContent: string): TextOperation[] {
    const operations: TextOperation[] = [];
    
    // 使用协作客户端处理本地编辑
    if (!this.collaborationClient) {
      this.collaborationClient = new CollaborationClient(this.clientId, oldContent);
    }
    
    // 简单的差异检测算法
    let i = 0;
    let j = 0;
    
    while (i < oldContent.length && j < newContent.length) {
      if (oldContent[i] === newContent[j]) {
        i++;
        j++;
      } else {
        // 发现差异点
        const startPos = j;
        
        // 查找插入的内容
        while (j < newContent.length && 
               (i >= oldContent.length || oldContent[i] !== newContent[j])) {
          j++;
        }
        
        const insertedText = newContent.substring(startPos, j);
        if (insertedText) {
          const op = this.collaborationClient.localEdit('insert', startPos, insertedText);
          operations.push({
            type: 'insert',
            position: op.position,
            content: op.content,
            clientId: op.clientId,
            timestamp: op.timestamp
          });
        }
        
        // 查找删除的内容
        const deleteStart = i;
        while (i < oldContent.length && 
               (j >= newContent.length || oldContent[i] !== newContent[j])) {
          i++;
        }
        
        if (i > deleteStart) {
          const deleteContent = oldContent.substring(deleteStart, i);
          const op = this.collaborationClient.localEdit('delete', deleteStart, deleteContent);
          operations.push({
            type: 'delete',
            position: op.position,
            content: op.content,
            clientId: op.clientId,
            timestamp: op.timestamp
          });
        }
      }
    }
    
    // 处理尾部内容
    if (j < newContent.length) {
      const op = this.collaborationClient.localEdit('insert', j, newContent.substring(j));
      operations.push({
        type: 'insert',
        position: op.position,
        content: op.content,
        clientId: op.clientId,
        timestamp: op.timestamp
      });
    }
    
    if (i < oldContent.length) {
      const op = this.collaborationClient.localEdit('delete', i, oldContent.substring(i));
      operations.push({
        type: 'delete',
        position: op.position,
        content: op.content,
        clientId: op.clientId,
        timestamp: op.timestamp
      });
    }
    
    return operations;
  }

  private setupAutoSync(): void {
    interval(this.syncInterval)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (this.pendingOperations.length > 0) {
            return this.syncOperations();
          }
          return new Observable(observer => observer.complete());
        })
      )
      .subscribe();
  }

  private syncOperations(): Observable<any> {
    if (this.pendingOperations.length === 0) {
      return new Observable(observer => observer.complete());
    }

    const operationsToSend = [...this.pendingOperations];
    this.pendingOperations = [];

    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/operations/batch`;
    
    return this.http.post(url, operationsToSend);
  }

  private applyRemoteOperations(operations: DocumentOperation[]): void {
    if (!this.collaborationClient) {
      this.collaborationClient = new CollaborationClient(this.clientId, this.editorContent);
    }
    
    // 转换远程操作为本地格式
    const textOps: TextOperation[] = operations
      .filter(op => op.client_id !== this.clientId) // 忽略自己的操作
      .map(op => ({
        type: op.operation_type as 'insert' | 'delete',
        position: op.position,
        content: op.content || '',
        clientId: op.client_id,
        timestamp: new Date(op.timestamp).getTime()
      }));
    
    // 使用OT算法处理远程操作
    const transformedOps = this.collaborationClient.handleRemoteOperations(textOps);
    
    // 更新编辑器内容
    const newContent = this.collaborationClient.getCurrentContent();
    this.editorContent = newContent;
    this.contentChange.emit(newContent);
  }

  private applyOperation(content: string, operation: DocumentOperation): string {
    const pos = operation.position;
    
    if (operation.operation_type === 'insert') {
      if (pos >= content.length) {
        return content + (operation.content || '');
      } else {
        return content.slice(0, pos) + (operation.content || '') + content.slice(pos);
      }
    } else if (operation.operation_type === 'delete') {
      const deleteLen = operation.content ? operation.content.length : 1;
      if (pos >= content.length) {
        return content;
      } else if (pos + deleteLen >= content.length) {
        return content.slice(0, pos);
      } else {
        return content.slice(0, pos) + content.slice(pos + deleteLen);
      }
    }
    
    return content;
  }

  onCursorPositionChange(position: number): void {
    this.currentCursorPosition = position;
    this.updateRemoteCursorPosition();
  }

  private updateRemoteCursorPosition(): void {
    if (!this.sessionId) return;

    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/sessions/${this.sessionId}/cursor`;
    
    this.http.put(url, {
      cursor_position: this.currentCursorPosition
    }).subscribe({
      error: (error) => {
        console.error('更新光标位置失败:', error);
      }
    });
  }

  // 评论功能
  addComment(startPos: number, endPos: number, content: string): void {
    if (!this.documentInfo?.allow_comments) {
      this.snackBar.open('此文档不允许添加评论', '关闭', { duration: 3000 });
      return;
    }

    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/comments`;
    
    this.http.post<DocumentComment>(url, {
      start_position: startPos,
      end_position: endPos,
      content: content,
      comment_type: 'comment'
    }).subscribe({
      next: (comment) => {
        this.comments.push({
          ...comment,
          user_name: this.userName
        });
        this.snackBar.open('评论已添加', '', { duration: 2000 });
      },
      error: (error) => {
        console.error('添加评论失败:', error);
        this.snackBar.open('添加评论失败', '关闭', { duration: 3000 });
      }
    });
  }

  loadComments(): void {
    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/comments`;
    
    this.http.get<DocumentComment[]>(url).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error) => {
        console.error('加载评论失败:', error);
      }
    });
  }

  private addRemoteComment(comment: any): void {
    this.comments.push(comment);
  }

  resolveComment(commentId: number): void {
    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/comments/${commentId}/resolve`;
    
    this.http.put(url, {}).subscribe({
      next: () => {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          comment.is_resolved = true;
        }
        this.snackBar.open('评论已标记为已解决', '', { duration: 2000 });
      },
      error: (error) => {
        console.error('解决评论失败:', error);
        this.snackBar.open('解决评论失败', '关闭', { duration: 3000 });
      }
    });
  }

  // 建议功能
  addSuggestion(startPos: number, endPos: number, suggestedContent: string, reason?: string): void {
    if (!this.documentInfo?.allow_suggestions) {
      this.snackBar.open('此文档不允许添加建议', '关闭', { duration: 3000 });
      return;
    }

    const originalContent = this.editorContent.substring(startPos, endPos);
    
    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/suggestions`;
    
    this.http.post<DocumentSuggestion>(url, {
      start_position: startPos,
      end_position: endPos,
      original_content: originalContent,
      suggested_content: suggestedContent,
      suggestion_reason: reason
    }).subscribe({
      next: (suggestion) => {
        this.suggestions.push({
          ...suggestion,
          user_name: this.userName
        });
        this.snackBar.open('建议已添加', '', { duration: 2000 });
      },
      error: (error) => {
        console.error('添加建议失败:', error);
        this.snackBar.open('添加建议失败', '关闭', { duration: 3000 });
      }
    });
  }

  loadSuggestions(): void {
    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/suggestions`;
    
    this.http.get<DocumentSuggestion[]>(url).subscribe({
      next: (suggestions) => {
        this.suggestions = suggestions;
      },
      error: (error) => {
        console.error('加载建议失败:', error);
      }
    });
  }

  private addRemoteSuggestion(suggestion: any): void {
    this.suggestions.push(suggestion);
  }

  reviewSuggestion(suggestionId: number, status: 'accepted' | 'rejected'): void {
    const url = `/api/v1/org/${this.orgId}/courses/${this.courseId}/collaborative-documents/${this.documentId}/suggestions/${suggestionId}/review`;
    
    this.http.put(url, { status }).subscribe({
      next: (response: any) => {
        const suggestion = this.suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
          suggestion.status = status;
        }
        
        if (status === 'accepted') {
          // 应用建议到文档内容
          this.applySuggestion(response.suggestion);
        }
        
        this.snackBar.open(`建议已${status === 'accepted' ? '接受' : '拒绝'}`, '', { duration: 2000 });
      },
      error: (error) => {
        console.error('审核建议失败:', error);
        this.snackBar.open('审核建议失败', '关闭', { duration: 3000 });
      }
    });
  }

  private applySuggestion(suggestion: any): void {
    const before = this.editorContent.substring(0, suggestion.start_position);
    const after = this.editorContent.substring(suggestion.end_position);
    this.editorContent = before + suggestion.suggested_content + after;
    this.contentChange.emit(this.editorContent);
  }

  // 用户管理
  private updateRemoteCursor(message: any): void {
    const existingUser = this.activeUsers.find(u => u.userId === message.user_id);
    if (existingUser) {
      existingUser.cursorPosition = message.cursor_position;
    } else {
      this.activeUsers.push({
        userId: message.user_id,
        userName: message.user_name,
        cursorPosition: message.cursor_position
      });
    }
  }

  private removeUser(sessionId: string): void {
    // 这里可以根据sessionId移除用户
    // 需要在服务端维护session到user的映射
  }

  // 工具方法
  toggleCommentsPanel(): void {
    this.showCommentsPanel = !this.showCommentsPanel;
  }

  toggleSuggestionsPanel(): void {
    this.showSuggestionsPanel = !this.showSuggestionsPanel;
  }

  getConnectedUsersCount(): number {
    return this.activeUsers.length + 1; // +1 表示自己
  }
}
