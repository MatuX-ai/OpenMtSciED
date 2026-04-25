import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuestionBank {
  id: number;
  name: string;
  description?: string;
  source?: string;
  subject?: string;
  level?: string;
  total_questions: number;
}

export interface Question {
  id: number;
  bank_id: number;
  content: string;
  question_type: string;
  options_json?: any[];
  correct_answer: string;
  explanation?: string;
  difficulty: number;
  knowledge_points?: string[];
  course_ids?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:8000/api/v1/learning'; 

  constructor(private http: HttpClient) {}

  getQuestionBanks(skip = 0, limit = 100): Observable<{ success: boolean; data: QuestionBank[] }> {
    const params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: QuestionBank[] }>(`${this.apiUrl}/banks`, { params });
  }

  getQuestions(bankId?: number, skip = 0, limit = 50): Observable<{ success: boolean; data: Question[] }> {
    let params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
    if (bankId) {
      params = params.set('bank_id', bankId.toString());
    }
    return this.http.get<{ success: boolean; data: Question[] }>(`${this.apiUrl}/questions`, { params });
  }

  submitAnswer(questionId: number, answerContent: string, timeSpent: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit-answer`, {
      question_id: questionId,
      answer_content: answerContent,
      time_spent_seconds: timeSpent
    });
  }

  getHistory(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/my-history`);
  }

  getStats(): Observable<{ success: boolean; overall_accuracy: number; knowledge_mastery: any }> {
    return this.http.get<{ success: boolean; overall_accuracy: number; knowledge_mastery: any }>(`${this.apiUrl}/stats`);
  }

  getAdaptiveQuestion(): Observable<{ success: boolean; data: Question[]; target_difficulty: number }> {
    return this.http.get<{ success: boolean; data: Question[]; target_difficulty: number }>(`${this.apiUrl}/adaptive-quiz`);
  }
}
