/**
 * 课件协作编辑模型
 * 
 * 支持多人实时编辑、编辑冲突检测、变更追踪
 */

/**
 * 协作会话
 */
export interface CollaborationSession {
  id: number;
  material_id: number;
  session_id: string;
  started_by: number;
  started_by_name: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  participant_count: number;
}

/**
 * 协作参与者
 */
export interface CollaborationParticipant {
  user_id: number;
  user_name: string;
  avatar_url?: string;
  joined_at: string;
  is_online: boolean;
  is_editing: boolean;
  cursor_position?: CursorPosition;
}

/**
 * 光标位置
 */
export interface CursorPosition {
  line: number;
  column: number;
  file_path?: string;
}

/**
 * 编辑变更
 */
export interface EditChange {
  id: string;
  session_id: string;
  material_id: number;
  user_id: number;
  user_name: string;
  change_type: 'insert' | 'delete' | 'replace';
  content: string;
  position: number;
  length: number;
  old_content?: string;
  timestamp: string;
  is_applied: boolean;
}

/**
 * 编辑冲突
 */
export interface EditConflict {
  id: string;
  session_id: string;
  change1: EditChange;
  change2: EditChange;
  conflict_type: 'same_position' | 'overlap' | 'concurrent';
  detected_at: string;
  resolved_by?: number;
  resolved_by_name?: string;
  resolved_at?: string;
  resolution?: 'accept_first' | 'accept_second' | 'merge';
}

/**
 * 变更追踪记录
 */
export interface ChangeTrackingRecord {
  id: number;
  material_id: number;
  version_id: number;
  change_type: 'insert' | 'delete' | 'replace' | 'format';
  user_id: number;
  user_name: string;
  content_before?: string;
  content_after?: string;
  position?: number;
  length?: number;
  timestamp: string;
  session_id?: string;
}

/**
 * 创建协作会话请求
 */
export interface CreateCollaborationSessionRequest {
  material_id: number;
  duration_minutes?: number;
  allow_comment?: boolean;
  auto_save?: boolean;
  auto_save_interval_seconds?: number;
}

/**
 * 加入协作会话响应
 */
export interface JoinSessionResponse {
  session: CollaborationSession;
  participants: CollaborationParticipant[];
  current_content: string;
  existing_changes: EditChange[];
}

/**
 * WebSocket消息
 */
export type CollaborationMessage =
  | { type: 'user_joined'; participant: CollaborationParticipant }
  | { type: 'user_left'; user_id: number }
  | { type: 'cursor_moved'; user_id: number; position: CursorPosition }
  | { type: 'edit_change'; change: EditChange }
  | { type: 'conflict_detected'; conflict: EditConflict }
  | { type: 'auto_save'; saved_at: string }
  | { type: 'session_expired'; reason: string }
  | { type: 'participant_list'; participants: CollaborationParticipant[] }
  | { type: 'ping'; timestamp: string }
  | { type: 'pong'; timestamp: string };

/**
 * 协作统计
 */
export interface CollaborationStatistics {
  material_id: number;
  total_sessions: number;
  total_participants: number;
  total_changes: number;
  total_conflicts: number;
  average_session_duration: number;
  most_active_participants: {
    user_id: number;
    user_name: string;
    change_count: number;
  }[];
}

/**
 * 类型守卫
 */
export function isCollaborationSession(obj: any): obj is CollaborationSession {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.material_id === 'number' &&
    typeof obj.session_id === 'string' &&
    typeof obj.is_active === 'boolean'
  );
}

export function isEditChange(obj: any): obj is EditChange {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.session_id === 'string' &&
    typeof obj.material_id === 'number' &&
    typeof obj.change_type === 'string' &&
    typeof obj.timestamp === 'string'
  );
}

export function isEditConflict(obj: any): obj is EditConflict {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.session_id === 'string' &&
    isEditChange(obj.change1) &&
    isEditChange(obj.change2) &&
    typeof obj.conflict_type === 'string'
  );
}

export function isCollaborationMessage(obj: any): obj is CollaborationMessage {
  return (
    obj &&
    typeof obj.type === 'string' &&
    ['user_joined', 'user_left', 'cursor_moved', 'edit_change', 
     'conflict_detected', 'auto_save', 'session_expired', 'participant_list',
     'ping', 'pong'].includes(obj.type)
  );
}
