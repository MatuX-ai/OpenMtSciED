import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ContextNode {
  name?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-ai-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-tutor-container">
      <div class="tutor-header">
        <h3>🤖 AI 虚拟导师</h3>
        <button class="toggle-btn" (click)="toggleChat()">
          {{ isExpanded ? '−' : '+' }}
        </button>
      </div>

      <div class="chat-content" *ngIf="isExpanded">
        <div class="messages" #messagesContainer>
          <div
            *ngFor="let msg of messages"
            class="message"
            [class.user]="msg.role === 'user'"
            [class.assistant]="msg.role === 'assistant'"
          >
            <div class="message-bubble">{{ msg.content }}</div>
            <div class="message-time">
              {{ msg.timestamp | date: 'HH:mm' }}
            </div>
          </div>
          <div *ngIf="isLoading" class="message assistant">
            <div class="message-bubble typing">思考中...</div>
          </div>
        </div>

        <div class="input-area">
          <textarea
            [(ngModel)]="userInput"
            placeholder="问我关于知识点的问题..."
            (keyup.enter)="sendMessage()"
            [disabled]="isLoading"
          ></textarea>
          <button (click)="sendMessage()" [disabled]="isLoading || !userInput.trim()">发送</button>
        </div>

        <div class="quick-questions" *ngIf="contextNode">
          <p class="suggestion-label">💡 建议问题：</p>
          <button *ngFor="let q of suggestedQuestions" (click)="askQuestion(q)" class="quick-btn">
            {{ q }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .ai-tutor-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        max-height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        display: flex;
        flex-direction: column;
      }
      .tutor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
      }
      .tutor-header h3 {
        margin: 0;
        font-size: 16px;
      }
      .toggle-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
      }
      .toggle-btn:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .chat-content {
        display: flex;
        flex-direction: column;
        max-height: 400px;
      }
      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        max-height: 300px;
      }
      .message {
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
      }
      .message.user {
        align-items: flex-end;
      }
      .message.assistant {
        align-items: flex-start;
      }
      .message-bubble {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 12px;
        word-wrap: break-word;
        line-height: 1.5;
      }
      .message.user .message-bubble {
        background: #667eea;
        color: white;
        border-bottom-right-radius: 4px;
      }
      .message.assistant .message-bubble {
        background: #f0f0f0;
        color: #333;
        border-bottom-left-radius: 4px;
      }
      .message-bubble.typing {
        font-style: italic;
        color: #999;
      }
      .message-time {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        padding: 0 4px;
      }
      .input-area {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #eee;
      }
      textarea {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        resize: none;
        font-family: inherit;
        font-size: 14px;
        min-height: 40px;
        max-height: 100px;
      }
      textarea:focus {
        outline: none;
        border-color: #667eea;
      }
      button {
        padding: 10px 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }
      button:hover:not(:disabled) {
        background: #5568d3;
      }
      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      .quick-questions {
        padding: 12px 16px;
        border-top: 1px solid #eee;
        background: #f8f9fa;
      }
      .suggestion-label {
        margin: 0 0 8px 0;
        font-size: 13px;
        color: #666;
      }
      .quick-btn {
        display: block;
        width: 100%;
        margin-bottom: 6px;
        padding: 8px 12px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        text-align: left;
        font-size: 13px;
        color: #333;
      }
      .quick-btn:hover {
        background: #f0f0f0;
        border-color: #667eea;
      }
    `,
  ],
})
export class AiTutorComponent {
  @Input() contextNode: ContextNode | null = null;

  isExpanded = true;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;

  constructor() {
    // 初始化欢迎消息
    this.addMessage('assistant', '你好！我是你的 AI 学习导师。有什么可以帮助你的吗？');
  }

  toggleChat(): void {
    this.isExpanded = !this.isExpanded;
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput.trim();
    this.addMessage('user', userMessage);
    this.userInput = '';
    this.isLoading = true;

    // TODO: 调用后端 AI API
    setTimeout(() => {
      this.simulateAIResponse(userMessage);
      this.isLoading = false;
    }, 1500);
  }

  askQuestion(question: string): void {
    this.userInput = question;
    this.sendMessage();
  }

  private addMessage(role: 'user' | 'assistant', content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date(),
    });
  }

  private simulateAIResponse(userQuestion: string): void {
    // 模拟 AI 响应（实际应调用 MiniCPM API）
    let response = '';

    if (userQuestion.includes('光合作用')) {
      response =
        '光合作用是植物利用光能将二氧化碳和水转化为有机物和氧气的过程。公式：6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂。你想了解哪个阶段？';
    } else if (userQuestion.includes('电路') || userQuestion.includes('欧姆定律')) {
      response =
        '欧姆定律描述了电压、电流和电阻的关系：V = I × R。在电路中，电压推动电流通过电阻。需要我解释具体应用吗？';
    } else {
      response = `关于"${userQuestion}"，这是一个很好的问题。让我为你详细解释...\n\n在实际实现中，这里会调用 MiniCPM 模型生成更准确的回答。`;
    }

    this.addMessage('assistant', response);
  }

  get suggestedQuestions(): string[] {
    if (!this.contextNode) {
      return ['什么是 STEM 教育？', '如何开始学习路径？', '硬件项目需要什么材料？'];
    }

    // 根据当前节点生成建议问题
    const nodeName = this.contextNode?.name ?? '';
    if (nodeName.includes('光合')) {
      return [
        '光合作用的化学方程式是什么？',
        '光合作用和呼吸作用有什么区别？',
        '如何用实验验证光合作用？',
      ];
    } else if (nodeName.includes('电路')) {
      return ['欧姆定律的公式是什么？', '串联和并联电路有什么区别？', '如何测量电路中的电流？'];
    }

    return [
      `能详细解释${nodeName}吗？`,
      `${nodeName}的实际应用有哪些？`,
      `学习${nodeName}需要先掌握什么？`,
    ];
  }
}
