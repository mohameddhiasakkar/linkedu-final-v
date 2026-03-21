import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
  id: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string; // may be hidden from student
}

export interface StudentAnswerDTO {
  questionId: number;
  selectedOption: 'A' | 'B' | 'C' | 'D';
}

export interface QuizSubmitResult {
  quizAttemptId: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class StudentQuizService {

  private readonly base = 'http://localhost:8080/api/student-quiz';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // GET /api/student-quiz/quiz/{quizId}/questions
  getQuizQuestions(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(
      `${this.base}/quiz/${quizId}/questions`,
      { headers: this.authHeaders() }
    );
  }

  // POST /api/student-quiz/submit?studentId=&quizId=
  submitQuiz(
    studentId: number,
    quizId: number,
    answers: StudentAnswerDTO[]
  ): Observable<QuizSubmitResult> {
    const params = new HttpParams()
      .set('studentId', studentId)
      .set('quizId', quizId);
    return this.http.post<QuizSubmitResult>(
      `${this.base}/submit`,
      answers,
      { headers: this.authHeaders(), params }
    );
  }
}