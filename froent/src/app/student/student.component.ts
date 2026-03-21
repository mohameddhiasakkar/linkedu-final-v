import {
  Component, OnInit, OnDestroy,
  signal, ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription, interval, firstValueFrom } from 'rxjs';

import { StudentProfile, Document as StudentDoc } from './student.model';
import { StudentProfileService } from './student.service';
import { ChatService } from '../agent/chat.service';
import { ChatMessage } from '../agent/chat-message.model';
import { DocumentService, BackendDocument, DocumentStatus } from './Document.service';
import { StudentQuizService, Question, StudentAnswerDTO, QuizSubmitResult } from './Student quiz.service';

// ── Local form interfaces ──────────────────────────────────────────────────
interface CvForm       { file: File|null; summary: string; experience: string; skills: string; }
interface PassportForm { file: File|null; issueDate: string; expiryDate: string; issuingCountry: string; }
interface IdCardForm   { file: File|null; numId: string; birthday: string; }

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentProfileComponent implements OnInit, OnDestroy, AfterViewChecked {

  // ── Profile ────────────────────────────────────────────────────────────────
  student: StudentProfile | null = null;
  isLoading    = true;
  errorMessage = '';

  // ── Shared user ID (set once profile loads) ────────────────────────────────
  myUserId: number | null = null;

  // ── Chat ───────────────────────────────────────────────────────────────────
  agentId: number | null = null;
  agentIdInput = '';
  chatMessages   = signal<ChatMessage[]>([]);
  loadingChat    = signal(false);
  sendingMessage = false;
  newMessage     = '';
  unreadCount    = signal(0);

  private pollSub:   Subscription | null = null;
  private unreadSub: Subscription | null = null;
  private readonly POLL_MS = 8000;
  private shouldScrollChat = false;

  @ViewChild('chatScrollArea') chatScrollArea!: ElementRef<HTMLDivElement>;

  // ── Documents ──────────────────────────────────────────────────────────────
  backendDocs  = signal<BackendDocument[]>([]);
  loadingDocs  = signal(false);
  uploadingDoc = false;
  docError     = '';
  docSuccess   = '';
  uploadPanel: null | 'cv' | 'passport' | 'idcard' = null;

  cvForm:       CvForm       = { file: null, summary: '', experience: '', skills: '' };
  passportForm: PassportForm = { file: null, issueDate: '', expiryDate: '', issuingCountry: '' };
  idCardForm:   IdCardForm   = { file: null, numId: '', birthday: '' };

  // ── Quiz ───────────────────────────────────────────────────────────────────
  quizView: 'load' | 'taking' | 'result' = 'load';
  quizIdInput  = '';
  quizId: number | null = null;
  questions: Question[] = [];
  loadingQuiz  = false;
  quizError    = '';
  answers: Record<number, 'A' | 'B' | 'C' | 'D'> = {};
  submittingQuiz = false;
  quizResult: QuizSubmitResult | null = null;

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor(
    private studentProfileService: StudentProfileService,
    private chatSvc: ChatService,
    private docSvc:  DocumentService,
    private quizSvc: StudentQuizService,
  ) {}

  ngOnInit(): void { this.loadMyProfile(); }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) { this.scrollToBottom(); this.shouldScrollChat = false; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PROFILE
  // ══════════════════════════════════════════════════════════════════════════

  loadMyProfile(): void {
    this.isLoading = true;
    this.studentProfileService.getMyProfile().subscribe({
      next: profile => {
        this.student  = profile;
        this.myUserId = profile.id ?? null;
        this.isLoading = false;
        if (this.myUserId) {
          this.startUnreadPoll();
          this.loadBackendDocuments();
        }
      },
      error: err => {
        this.errorMessage = err.error?.error || 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  downloadDocument(doc: StudentDoc): void { window.open(doc.url, '_blank'); }

  // ══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS — wired to DocumentController
  // ══════════════════════════════════════════════════════════════════════════

  /** GET /api/documents/student/{studentId} */
  loadBackendDocuments(): void {
    if (!this.myUserId) return;
    this.loadingDocs.set(true);
    this.docSvc.getStudentDocuments(this.myUserId)
      .pipe(finalize(() => this.loadingDocs.set(false)))
      .subscribe({
        next:  docs => this.backendDocs.set(docs),
        error: ()   => { this.docError = 'Failed to load documents.'; }
      });
  }

  openUploadPanel(panel: 'cv' | 'passport' | 'idcard'): void {
    this.uploadPanel = this.uploadPanel === panel ? null : panel;
    this.docError = ''; this.docSuccess = '';
  }

  onFileSelected(event: Event, target: 'cv' | 'passport' | 'idcard'): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (target === 'cv')       this.cvForm.file      = file;
    if (target === 'passport') this.passportForm.file = file;
    if (target === 'idcard')   this.idCardForm.file   = file;
  }

  /** POST /api/documents/cv */
  uploadCv(): void {
    if (!this.myUserId || !this.cvForm.file) { this.docError = 'Please select a file.'; return; }
    this.uploadingDoc = true;
    this.docSvc.uploadCv(
      this.myUserId, this.cvForm.file,
      this.cvForm.summary    || undefined,
      this.cvForm.experience || undefined,
      this.cvForm.skills     || undefined
    ).pipe(finalize(() => (this.uploadingDoc = false))).subscribe({
      next: doc => {
        this.backendDocs.update(p => [doc, ...p]);
        this.docSuccess = 'CV uploaded!';
        this.uploadPanel = null;
        this.cvForm = { file: null, summary: '', experience: '', skills: '' };
      },
      error: () => { this.docError = 'CV upload failed.'; }
    });
  }

  /** POST /api/documents/passport */
  uploadPassport(): void {
    const f = this.passportForm;
    if (!this.myUserId || !f.file || !f.issueDate || !f.expiryDate || !f.issuingCountry) {
      this.docError = 'Please fill all passport fields.'; return;
    }
    this.uploadingDoc = true;
    this.docSvc.uploadPassport(this.myUserId, f.file, f.issueDate, f.expiryDate, f.issuingCountry)
      .pipe(finalize(() => (this.uploadingDoc = false))).subscribe({
        next: doc => {
          this.backendDocs.update(p => [doc, ...p]);
          this.docSuccess = 'Passport uploaded!';
          this.uploadPanel = null;
          this.passportForm = { file: null, issueDate: '', expiryDate: '', issuingCountry: '' };
        },
        error: () => { this.docError = 'Passport upload failed.'; }
      });
  }

  /** POST /api/documents/id-card */
  uploadIdCard(): void {
    const f = this.idCardForm;
    if (!this.myUserId || !f.file || !f.numId || !f.birthday) {
      this.docError = 'Please fill all ID card fields.'; return;
    }
    this.uploadingDoc = true;
    this.docSvc.uploadIdCard(this.myUserId, f.file, f.numId, f.birthday)
      .pipe(finalize(() => (this.uploadingDoc = false))).subscribe({
        next: doc => {
          this.backendDocs.update(p => [doc, ...p]);
          this.docSuccess = 'ID Card uploaded!';
          this.uploadPanel = null;
          this.idCardForm = { file: null, numId: '', birthday: '' };
        },
        error: () => { this.docError = 'ID Card upload failed.'; }
      });
  }

  // ── Document helpers ───────────────────────────────────────────────────────

  docIcon(type: string): string {
    return ({ CV: '📄', PASSPORT: '🛂', ID_CARD: '🪪' } as any)[type] ?? '📁';
  }

  docStatusClass(status: DocumentStatus): string {
    return ({
      PENDING:  'bg-yellow-100 text-yellow-700',
      VERIFIED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    } as any)[status] ?? '';
  }

  docStatusIcon(status: DocumentStatus): string {
    return ({ PENDING: '⏳', VERIFIED: '✅', REJECTED: '❌' } as any)[status] ?? '';
  }

  openDocFile(doc: BackendDocument): void { if (doc.fileUrl) window.open(doc.fileUrl, '_blank'); }

  // ══════════════════════════════════════════════════════════════════════════
  // QUIZ — wired to StudentQuizController
  // ══════════════════════════════════════════════════════════════════════════

  /** GET /api/student-quiz/quiz/{quizId}/questions */
  loadQuiz(): void {
    const id = parseInt(this.quizIdInput, 10);
    if (isNaN(id) || id < 1) { this.quizError = 'Please enter a valid Quiz ID.'; return; }
    this.quizId    = id;
    this.quizError = '';
    this.answers   = {};
    this.loadingQuiz = true;
    this.quizSvc.getQuizQuestions(id)
      .pipe(finalize(() => (this.loadingQuiz = false)))
      .subscribe({
        next: qs => {
          if (qs.length === 0) { this.quizError = 'No questions found for this quiz.'; }
          else { this.questions = qs; this.quizView = 'taking'; }
        },
        error: () => { this.quizError = 'Failed to load quiz. Check the Quiz ID.'; }
      });
  }

  selectAnswer(questionId: number, option: 'A' | 'B' | 'C' | 'D'): void {
    this.answers = { ...this.answers, [questionId]: option };
  }

  isSelected(questionId: number, option: string): boolean {
    return this.answers[questionId] === option;
  }

  get allAnswered(): boolean {
    return this.questions.every(q => this.answers[q.id] !== undefined);
  }

  answeredCount(): number { return Object.keys(this.answers).length; }

  /** POST /api/student-quiz/submit */
  submitQuiz(): void {
    if (!this.myUserId || !this.quizId || !this.allAnswered) return;
    this.submittingQuiz = true;
    const payload: StudentAnswerDTO[] = this.questions.map(q => ({
      questionId:     q.id,
      selectedOption: this.answers[q.id],
    }));
    this.quizSvc.submitQuiz(this.myUserId, this.quizId, payload)
      .pipe(finalize(() => (this.submittingQuiz = false)))
      .subscribe({
        next:  result => { this.quizResult = result; this.quizView = 'result'; },
        error: ()     => { this.quizError = 'Submission failed. Please try again.'; }
      });
  }

  resetQuiz(): void {
    this.quizView    = 'load';
    this.quizIdInput = '';
    this.quizId      = null;
    this.questions   = [];
    this.answers     = {};
    this.quizResult  = null;
    this.quizError   = '';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHAT — wired to ChatController
  // ══════════════════════════════════════════════════════════════════════════

  onAgentIdChange(): void {
    const parsed = parseInt(this.agentIdInput, 10);
    if (isNaN(parsed) || parsed < 1) return;
    this.agentId = parsed;
    this.loadConversation();
    this.startConversationPoll();
  }

  openChatWith(id: number): void {
    this.agentId      = id;
    this.agentIdInput = String(id);
    this.loadConversation();
    this.startConversationPoll();
  }

  /** GET /api/chat/conversation — both directions merged */
  loadConversation(): void {
    if (!this.myUserId || !this.agentId) return;
    this.loadingChat.set(true);
    Promise.all([
      firstValueFrom(this.chatSvc.getConversation(this.myUserId, this.agentId)).catch(() => [] as ChatMessage[]),
      firstValueFrom(this.chatSvc.getConversation(this.agentId, this.myUserId)).catch(() => [] as ChatMessage[]),
    ]).then(([d1, d2]) => {
      const map = new Map<number, ChatMessage>();
      [...(d1 ?? []), ...(d2 ?? [])].forEach(m => map.set(m.id, m));
      const sorted = [...map.values()].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      this.chatMessages.set(sorted);
      this.markIncomingAsSeen(sorted);
      this.loadingChat.set(false);
      this.shouldScrollChat = true;
    });
  }

  /** PUT /api/chat/{id}/seen */
  private markIncomingAsSeen(msgs: ChatMessage[]): void {
    msgs
      .filter(m => !m.seen && m.receiver?.id === this.myUserId)
      .forEach(m => this.chatSvc.markAsSeen(m.id).subscribe({ error: () => {} }));
  }

  /** POST /api/chat */
  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || !this.myUserId || !this.agentId || this.sendingMessage) return;
    this.sendingMessage = true;
    this.chatSvc.sendMessage(this.myUserId, this.agentId, text)
      .pipe(finalize(() => (this.sendingMessage = false)))
      .subscribe({
        next: msg => {
          this.newMessage = '';
          this.chatMessages.update(p => [...p, msg]);
          this.shouldScrollChat = true;
          this.loadConversation();
        },
        error: () => console.error('Send failed'),
      });
  }

  onComposeKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
  }

  /** GET /api/chat/unread/{userId} */
  loadUnread(): void {
    if (!this.myUserId) return;
    this.chatSvc.getUnreadMessages(this.myUserId).subscribe({
      next:  msgs => this.unreadCount.set(msgs.length),
      error: ()   => {}
    });
  }

  // ── Chat helpers ───────────────────────────────────────────────────────────

  isMine(msg: ChatMessage): boolean { return msg.sender?.id === this.myUserId; }

  senderInitials(msg: ChatMessage): string {
    return this.isMine(msg) ? (this.student?.name?.charAt(0)?.toUpperCase() ?? 'M') : 'A';
  }

  formatTime(iso: string): string {
    return iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  }

  formatDay(iso: string): string {
    return iso ? new Date(iso).toLocaleDateString() : '';
  }

  isNewDay(msgs: ChatMessage[], i: number): boolean {
    return i === 0 || this.formatDay(msgs[i].timestamp) !== this.formatDay(msgs[i - 1].timestamp);
  }

  private scrollToBottom(): void {
    try { const el = this.chatScrollArea?.nativeElement; if (el) el.scrollTop = el.scrollHeight; } catch {}
  }

  private startConversationPoll(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(this.POLL_MS).subscribe(() => {
      if (this.agentId) this.loadConversation();
    });
  }

  private startUnreadPoll(): void {
    this.loadUnread();
    this.unreadSub = interval(this.POLL_MS).subscribe(() => this.loadUnread());
  }
}