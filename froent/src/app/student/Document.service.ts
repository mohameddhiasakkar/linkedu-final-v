import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Models ─────────────────────────────────────────────────────────────────

export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type DocumentType   = 'CV' | 'PASSPORT' | 'ID_CARD';

export interface BackendDocument {
  id: number;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
  // CV fields
  summary?: string;
  experience?: string;
  skills?: string;
  // Passport fields
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  // ID Card fields
  numId?: string;
  birthday?: string;
  // Relations
  student?: { id: number; name?: string };
  verifiedByAgent?: { id: number; name?: string };
}

export interface VerifyDocumentRequestDTO {
  status: DocumentStatus;
}

// ── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DocumentService {

  private readonly base = 'http://localhost:8080/api/documents';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // POST /api/documents/cv
  uploadCv(
    studentId: number,
    file: File,
    summary?: string,
    experience?: string,
    skills?: string
  ): Observable<BackendDocument> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    if (summary)    form.append('summary', summary);
    if (experience) form.append('experience', experience);
    if (skills)     form.append('skills', skills);
    return this.http.post<BackendDocument>(`${this.base}/cv`, form, {
      headers: this.authHeaders()
    });
  }

  // POST /api/documents/passport
  uploadPassport(
    studentId: number,
    file: File,
    issueDate: string,
    expiryDate: string,
    issuingCountry: string
  ): Observable<BackendDocument> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('issueDate', issueDate);
    form.append('expiryDate', expiryDate);
    form.append('issuingCountry', issuingCountry);
    return this.http.post<BackendDocument>(`${this.base}/passport`, form, {
      headers: this.authHeaders()
    });
  }

  // POST /api/documents/id-card
  uploadIdCard(
    studentId: number,
    file: File,
    numId: string,
    birthday: string
  ): Observable<BackendDocument> {
    const form = new FormData();
    form.append('studentId', String(studentId));
    form.append('file', file);
    form.append('numId', numId);
    form.append('birthday', birthday);
    return this.http.post<BackendDocument>(`${this.base}/id-card`, form, {
      headers: this.authHeaders()
    });
  }

  // GET /api/documents/student/{studentId}
  getStudentDocuments(studentId: number): Observable<BackendDocument[]> {
    return this.http.get<BackendDocument[]>(
      `${this.base}/student/${studentId}`,
      { headers: this.authHeaders() }
    );
  }

  // PUT /api/documents/{documentId}/verify?agentId=
  verifyDocument(
    documentId: number,
    agentId: number,
    status: DocumentStatus
  ): Observable<BackendDocument> {
    const body: VerifyDocumentRequestDTO = { status };
    return this.http.put<BackendDocument>(
      `${this.base}/${documentId}/verify?agentId=${agentId}`,
      body,
      { headers: this.authHeaders() }
    );
  }
}