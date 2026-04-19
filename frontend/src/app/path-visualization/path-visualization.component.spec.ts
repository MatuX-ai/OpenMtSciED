import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PathVisualizationComponent } from './path-visualization.component';

describe('PathVisualizationComponent', () => {
  let component: PathVisualizationComponent;
  let httpMock: HttpTestingController;

  const mockPathResponse = {
    user_id: 'test_user_001',
    path_nodes: [
      {
        node_type: 'course_unit',
        node_id: 'OS-MS-Phys-001',
        title: '光与物质相互作用',
        difficulty: 2,
        estimated_hours: 12,
        description: '学科: 物理'
      },
      {
        node_type: 'knowledge_point',
        node_id: 'KP-Phys-001',
        title: '光的折射',
        difficulty: 2,
        estimated_hours: 1.5,
        description: '学科: 物理'
      },
      {
        node_type: 'hardware_project',
        node_id: 'HP-001',
        title: '简易光学实验',
        difficulty: 2,
        estimated_hours: 4,
        description: '成本: ¥30'
      }
    ],
    summary: {
      total_nodes: 3,
      total_hours: 17.5,
      avg_difficulty: 2
    },
    generated_at: '2026-04-18T10:00:00'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PathVisualizationComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();

    const fixture = TestBed.createComponent(PathVisualizationComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty path data', () => {
    expect(component.pathData).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('should call API and update path data on generatePath', () => {
    // Act
    component.generatePath();

    // Assert - 检查HTTP请求
    const req = httpMock.expectOne('/api/v1/path/generate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(component.testUser);

    // 模拟响应
    req.flush(mockPathResponse);

    // 验证数据更新
    expect(component.pathData).toEqual(mockPathResponse);
    expect(component.loading).toBeFalse();
    expect(component.pathData?.summary.total_nodes).toBe(3);
    expect(component.pathData?.summary.total_hours).toBe(17.5);
  });

  it('should handle API error gracefully', () => {
    // Spy on alert to prevent actual popup
    spyOn(window, 'alert');

    // Act
    component.generatePath();

    // Simulate error
    const req = httpMock.expectOne('/api/v1/path/generate');
    req.error(new ProgressEvent('error'));

    // Assert
    expect(component.loading).toBeFalse();
    expect(component.pathData).toBeNull();
    expect(window.alert).toHaveBeenCalled();
  });

  it('should disable button while loading', () => {
    component.loading = true;
    const fixture = TestBed.createComponent(PathVisualizationComponent);
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });

  it('should display stats when path data exists', () => {
    component.pathData = mockPathResponse;
    const fixture = TestBed.createComponent(PathVisualizationComponent);
    fixture.detectChanges();

    const statCards = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(statCards.length).toBe(3);
    expect(statCards[0].textContent).toContain('3');
    expect(statCards[1].textContent).toContain('17.5h');
    expect(statCards[2].textContent).toContain('2');
  });

  it('should map node types correctly', () => {
    expect(component.getNodeTypeName('course_unit')).toBe('课程单元');
    expect(component.getNodeTypeName('knowledge_point')).toBe('知识点');
    expect(component.getNodeTypeName('cross_discipline_kp')).toBe('跨学科知识点');
    expect(component.getNodeTypeName('textbook_chapter')).toBe('教材章节');
    expect(component.getNodeTypeName('hardware_project')).toBe('硬件项目');
    expect(component.getNodeTypeName('unknown')).toBe('unknown');
  });

  it('should have correct test user configuration', () => {
    expect(component.testUser.user_id).toBe('test_user_001');
    expect(component.testUser.age).toBe(14);
    expect(component.testUser.grade_level).toBe('初中');
    expect(component.testUser.max_nodes).toBe(15);
  });
});
