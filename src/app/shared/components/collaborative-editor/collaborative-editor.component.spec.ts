/**
 * 协作编辑前端组件测试
 * 使用Jest和Angular Testing Utilities
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { CollaborativeEditorComponent } from './collaborative-editor.component';
import { CollaborationClient } from './ot-algorithm';

describe('CollaborativeEditorComponent', () => {
  let component: CollaborativeEditorComponent;
  let fixture: ComponentFixture<CollaborativeEditorComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        FormsModule
      ],
      declarations: [CollaborativeEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CollaborativeEditorComponent);
    component = fixture.componentInstance;
    
    // 设置必需的输入属性
    component.courseId = 101;
    component.orgId = 1;
    component.documentId = 1;
    component.userId = 123;
    component.userName = '测试用户';
    
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load document on init', () => {
    const mockDocument = {
      id: 1,
      document_name: '测试文档',
      content: '文档内容',
      version_number: 1,
      allow_comments: true,
      allow_suggestions: true
    };

    fixture.detectChanges(); // 触发 ngOnInit

    const req = httpMock.expectOne(
      `/api/v1/org/1/courses/101/collaborative-documents/1`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockDocument);

    expect(component.documentInfo).toEqual(mockDocument);
    expect(component.editorContent).toBe('文档内容');
  });

  it('should handle document loading error', () => {
    spyOn(component['snackBar'], 'open');

    fixture.detectChanges();

    const req = httpMock.expectOne(
      `/api/v1/org/1/courses/101/collaborative-documents/1`
    );
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(component['snackBar'].open).toHaveBeenCalledWith(
      '加载文档失败', '关闭', { duration: 3000 }
    );
  });

  it('should calculate operations correctly', () => {
    const oldContent = 'Hello World';
    const newContent = 'Hello Beautiful World';
    
    const operations = (component as any).calculateOperations(oldContent, newContent);
    
    expect(operations.length).toBeGreaterThan(0);
    expect(operations[0].type).toBe('insert');
    expect(operations[0].content).toBe('Beautiful ');
  });

  it('should apply remote operations', () => {
    const mockOperations = [
      {
        id: 1,
        operation_type: 'insert',
        position: 5,
        content: 'TEST',
        client_id: 'other-user',
        user_id: 456,
        timestamp: '2026-02-26T10:00:00Z'
      }
    ];

    component.editorContent = 'Hello World';
    (component as any).applyRemoteOperations(mockOperations);

    // 验证内容已更新
    expect(component.editorContent).toContain('TEST');
  });

  it('should ignore own operations when applying remote operations', () => {
    component.clientId = 'my-client-id';
    
    const mockOperations = [
      {
        id: 1,
        operation_type: 'insert',
        position: 5,
        content: 'IGNORED',
        client_id: 'my-client-id', // 自己的操作
        user_id: 123,
        timestamp: '2026-02-26T10:00:00Z'
      }
    ];

    component.editorContent = 'Hello World';
    (component as any).applyRemoteOperations(mockOperations);

    // 内容不应该改变，因为是自己的操作
    expect(component.editorContent).toBe('Hello World');
  });

  it('should add comment', () => {
    component.documentInfo = {
      id: 1,
      document_name: '测试文档',
      content: '内容',
      version_number: 1,
      allow_comments: true,
      allow_suggestions: true
    } as any;

    spyOn(component['snackBar'], 'open');

    component.addComment(0, 2, '测试评论');

    const req = httpMock.expectOne(
      `/api/v1/org/1/courses/101/collaborative-documents/1/comments`
    );
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 1,
      content: '测试评论',
      user_name: '测试用户'
    });

    expect(component['snackBar'].open).toHaveBeenCalledWith(
      '评论已添加', '', { duration: 2000 }
    );
  });

  it('should reject comment when comments disabled', () => {
    component.documentInfo = {
      id: 1,
      document_name: '测试文档',
      content: '内容',
      version_number: 1,
      allow_comments: false, // 禁用评论
      allow_suggestions: true
    } as any;

    spyOn(component['snackBar'], 'open');

    component.addComment(0, 2, '测试评论');

    // 不应该发送HTTP请求
    httpMock.expectNone(
      `/api/v1/org/1/courses/101/collaborative-documents/1/comments`
    );

    expect(component['snackBar'].open).toHaveBeenCalledWith(
      '此文档不允许添加评论', '关闭', { duration: 3000 }
    );
  });

  it('should add suggestion', () => {
    component.documentInfo = {
      id: 1,
      document_name: '测试文档',
      content: '原文内容',
      version_number: 1,
      allow_comments: true,
      allow_suggestions: true
    } as any;

    spyOn(component['snackBar'], 'open');

    component.addSuggestion(0, 2, '建议内容', '修改理由');

    const req = httpMock.expectOne(
      `/api/v1/org/1/courses/101/collaborative-documents/1/suggestions`
    );
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 1,
      suggested_content: '建议内容',
      user_name: '测试用户'
    });

    expect(component['snackBar'].open).toHaveBeenCalledWith(
      '建议已添加', '', { duration: 2000 }
    );
  });

  it('should handle WebSocket connection', () => {
    // Mock WebSocket
    const mockWebSocket = {
      send: jasmine.createSpy('send'),
      close: jasmine.createSpy('close')
    };

    spyOn(window, 'WebSocket').and.returnValue(mockWebSocket as any);
    spyOn(component['snackBar'], 'open');

    (component as any).sessionId = 'test-session-id';
    (component as any).connectWebSocket();

    expect(window.WebSocket).toHaveBeenCalledWith(
      jasmine.stringContaining('/ws?session_id=test-session-id')
    );
  });

  it('should generate unique client ID', () => {
    const id1 = (component as any).generateClientId();
    const id2 = (component as any).generateClientId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(10);
  });

  it('should cleanup on destroy', () => {
    spyOn(component as any, 'disconnectWebSocket');
    
    component.ngOnDestroy();
    
    expect((component as any).disconnectWebSocket).toHaveBeenCalled();
    expect((component as any).destroy$.closed).toBe(true);
  });
});

describe('CollaborationClient', () => {
  let client: CollaborationClient;

  beforeEach(() => {
    client = new CollaborationClient('test-client', '初始内容');
  });

  it('should apply local edit operations', () => {
    const operation = client.localEdit('insert', 0, '前缀');
    
    expect(operation.type).toBe('insert');
    expect(operation.position).toBe(0);
    expect(operation.content).toBe('前缀');
    expect(operation.clientId).toBe('test-client');
  });

  it('should handle remote operations with transformation', () => {
    // 本地操作
    client.localEdit('insert', 0, '本地');
    
    // 远程操作
    const remoteOps = [{
      type: 'insert' as const,
      position: 0,
      content: '远程',
      clientId: 'remote-client',
      timestamp: Date.now()
    }];
    
    const transformedOps = client.handleRemoteOperations(remoteOps);
    
    expect(transformedOps.length).toBe(1);
    // 验证位置已正确转换
    expect(transformedOps[0].position).not.toBe(0);
  });

  it('should get current content', () => {
    client.localEdit('insert', 0, '测试');
    const content = client.getCurrentContent();
    
    expect(content).toContain('测试');
  });

  it('should track revision number', () => {
    const initialRevision = client.getCurrentRevision();
    client.localEdit('insert', 0, '内容');
    const newRevision = client.getCurrentRevision();
    
    expect(newRevision).toBe(initialRevision + 1);
  });
});

describe('OperationalTransformation', () => {
  const { OperationalTransformation } = require('./ot-algorithm');

  it('should transform insert-insert operations correctly', () => {
    const op1 = {
      type: 'insert',
      position: 5,
      content: 'ABC',
      clientId: 'client1',
      timestamp: 1000
    };
    
    const op2 = {
      type: 'insert',
      position: 3,
      content: 'XYZ',
      clientId: 'client2',
      timestamp: 1001
    };
    
    const transformed = OperationalTransformation.transform(op1, op2);
    
    // op1应该向后移动XYZ的长度
    expect(transformed.position).toBe(8);
  });

  it('should transform delete-insert operations correctly', () => {
    const deleteOp = {
      type: 'delete',
      position: 10,
      content: 'hello',
      clientId: 'client1',
      timestamp: 1000
    };
    
    const insertOp = {
      type: 'insert',
      position: 8,
      content: 'world',
      clientId: 'client2',
      timestamp: 1001
    };
    
    const transformed = OperationalTransformation.transform(deleteOp, insertOp);
    
    // 删除操作的位置应该向后移动
    expect(transformed.position).toBe(15);
  });

  it('should apply operations to content', () => {
    const content = 'Hello World';
    const operation = {
      type: 'insert',
      position: 5,
      content: ' Beautiful',
      clientId: 'test',
      timestamp: 1000
    };
    
    const newContent = OperationalTransformation.applyOperation(content, operation);
    
    expect(newContent).toBe('Hello Beautiful World');
  });

  it('should validate operations', () => {
    const content = 'Hello World';
    
    const validInsert = {
      type: 'insert',
      position: 5,
      content: 'test',
      clientId: 'test',
      timestamp: 1000
    };
    
    const invalidDelete = {
      type: 'delete',
      position: 50, // 超出范围
      content: 'test',
      clientId: 'test',
      timestamp: 1000
    };
    
    expect(OperationalTransformation.validateOperation(validInsert, content)).toBe(true);
    expect(OperationalTransformation.validateOperation(invalidDelete, content)).toBe(false);
  });
});
