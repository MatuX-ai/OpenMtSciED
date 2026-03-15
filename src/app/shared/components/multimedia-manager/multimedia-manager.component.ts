/*
 * 多媒体资源管理组件
 * 提供视频上传、3D模型预览、文档处理等功能的前端界面
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

interface MultimediaResource {
  id: number;
  org_id: number;
  course_id: number;
  title: string;
  description: string;
  media_type: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  original_url: string;
  processed_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  video_status: string;
  document_format: string;
  page_count: number;
  is_active: boolean;
  is_public: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

interface UploadResponse {
  resource_id: number;
  upload_url: string;
  upload_fields: any;
  max_file_size: number;
}

@Component({
  selector: 'app-multimedia-manager',
  templateUrl: './multimedia-manager.component.html',
  styleUrls: ['./multimedia-manager.component.scss']
})
export class MultimediaManagerComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  orgId = 1; // 实际应用中应该从路由参数获取
  courseId = 1; // 实际应用中应该从路由参数获取
  
  resources: MultimediaResource[] = [];
  selectedResource: MultimediaResource | null = null;
  isLoading = false;
  uploadProgress = 0;
  
  // 上传表单数据
  uploadForm = {
    title: '',
    description: '',
    mediaType: 'video',
    courseId: this.courseId
  };
  
  mediaTypes = [
    { value: 'video', label: '视频' },
    { value: 'audio', label: '音频' },
    { value: 'image', label: '图片' },
    { value: 'document', label: '文档' },
    { value: '3d_model', label: '3D模型' },
    { value: 'presentation', label: '演示文稿' }
  ];
  
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources(): void {
    this.isLoading = true;
    const url = `/api/v1/org/${this.orgId}/multimedia`;
    
    this.http.get<MultimediaResource[]>(url).subscribe({
      next: (data) => {
        this.resources = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('加载资源失败:', error);
        this.snackBar.open('加载资源失败', '关闭', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  uploadFile(file: File): void {
    // 验证文件大小
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxSize) {
      this.snackBar.open('文件大小不能超过5GB', '关闭', { duration: 3000 });
      return;
    }

    // 创建资源记录
    this.createResourceRecord(file).subscribe({
      next: (response) => {
        this.performDirectUpload(file, response.resource_id);
      },
      error: (error) => {
        console.error('创建资源记录失败:', error);
        this.snackBar.open('创建资源记录失败', '关闭', { duration: 3000 });
      }
    });
  }

  createResourceRecord(file: File) {
    const formData = new FormData();
    formData.append('course_id', this.uploadForm.courseId.toString());
    formData.append('title', this.uploadForm.title || file.name);
    formData.append('description', this.uploadForm.description || '');
    formData.append('media_type', this.uploadForm.mediaType);
    formData.append('file', file);

    return this.http.post<any>(
      `/api/v1/org/${this.orgId}/multimedia/upload`,
      formData
    );
  }

  performDirectUpload(file: File, resourceId: number): void {
    const formData = new FormData();
    formData.append('file', file);

    this.uploadProgress = 0;
    this.isLoading = true;

    // 这里应该使用实际的上传端点
    // 暂时使用模拟上传
    this.simulateUpload(file, resourceId);
  }

  simulateUpload(file: File, resourceId: number): void {
    // 模拟上传进度
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.uploadProgress = 0;
        this.isLoading = false;
        this.snackBar.open('文件上传成功', '关闭', { duration: 2000 });
        this.resetUploadForm();
        this.loadResources(); // 重新加载资源列表
      }
    }, 200);
  }

  resetUploadForm(): void {
    this.uploadForm = {
      title: '',
      description: '',
      mediaType: 'video',
      courseId: this.courseId
    };
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  deleteResource(resource: MultimediaResource): void {
    if (confirm(`确定要删除 "${resource.title}" 吗？`)) {
      const url = `/api/v1/org/${this.orgId}/multimedia/${resource.id}`;
      
      this.http.delete(url).subscribe({
        next: () => {
          this.snackBar.open('资源删除成功', '关闭', { duration: 2000 });
          this.loadResources();
        },
        error: (error) => {
          console.error('删除资源失败:', error);
          this.snackBar.open('删除资源失败', '关闭', { duration: 3000 });
        }
      });
    }
  }

  viewResource(resource: MultimediaResource): void {
    this.selectedResource = resource;
    
    // 根据资源类型打开不同的预览对话框
    switch (resource.media_type) {
      case 'video':
        this.openVideoPlayer(resource);
        break;
      case '3d_model':
        this.open3DViewer(resource);
        break;
      case 'document':
        this.openDocumentViewer(resource);
        break;
      default:
        this.snackBar.open('暂不支持此类型的预览', '关闭', { duration: 2000 });
    }
  }

  openVideoPlayer(resource: MultimediaResource): void {
    // 打开视频播放器对话框
    const videoUrl = resource.processed_url || resource.original_url;
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      this.snackBar.open('视频尚未处理完成', '关闭', { duration: 2000 });
    }
  }

  open3DViewer(resource: MultimediaResource): void {
    // 打开3D模型预览对话框
    const previewUrl = `/api/v1/org/${this.orgId}/multimedia/${resource.id}/preview-3d`;
    
    this.http.get(previewUrl, { responseType: 'text' }).subscribe({
      next: (htmlContent) => {
        // 创建预览窗口
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        if (previewWindow) {
          previewWindow.document.write(htmlContent);
          previewWindow.document.close();
        }
      },
      error: (error) => {
        console.error('获取3D预览失败:', error);
        this.snackBar.open('获取3D预览失败', '关闭', { duration: 3000 });
      }
    });
  }

  openDocumentViewer(resource: MultimediaResource): void {
    // 打开文档查看器
    const documentUrl = resource.processed_url || resource.original_url;
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      this.snackBar.open('文档尚未处理完成', '关闭', { duration: 2000 });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
  }

  getResourceIcon(mediaType: string): string {
    const iconMap: { [key: string]: string } = {
      'video': 'videocam',
      'audio': 'audiotrack',
      'image': 'image',
      'document': 'description',
      '3d_model': '3d_rotation',
      'presentation': 'slideshow'
    };
    return iconMap[mediaType] || 'insert_drive_file';
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'ready': 'status-ready',
      'processing': 'status-processing',
      'transcoding': 'status-transcoding',
      'failed': 'status-failed',
      'uploaded': 'status-uploaded'
    };
    return statusClasses[status] || 'status-default';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'ready': '就绪',
      'processing': '处理中',
      'transcoding': '转码中',
      'failed': '失败',
      'uploaded': '已上传'
    };
    return statusTexts[status] || status;
  }
}