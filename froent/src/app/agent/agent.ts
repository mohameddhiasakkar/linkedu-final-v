import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AgentReviewService, QuizAttempt, ReviewResult } from './agent-review.service';
import { finalize } from 'rxjs/operators';

type Tab = 'reviews' | 'assign';
type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
  visible: boolean;
}

@Component({
  selector: 'app-agent-review',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './agent-review.component.html',
  styleUrls: ['./agent-review.component.css'],
})
export class AgentReviewComponent implements OnInit {

  // ── State ──────────────────────────────────────────────────────────────────

  activeTab: Tab = 'reviews';
  agentId = 1;

  // Reviews
  attempts = signal<QuizAttempt[]>([]);
  loadingReviews = signal(false);
  reviewsError = signal<string | null>(null);

  pendingCount = computed(() => this.attempts().filter(a => a.passed === null).length);
  passedCount  = computed(() => this.attempts().filter(a => a.passed === true).length);
  failedCount  = computed(() => this.attempts().filter(a => a.passed === false).length);

  // Modal
  modalOpen = false;
  activeAttempt: QuizAttempt | null = null;
  selectedVerdict: boolean | null = null;
  finalScore = 75;
  submittingReview = false;

  // Assign form
  questionId: number | null = null;
  quizId: number | null = null;
  assignLoading = false;
  assignResult: string | null = null;

  // Toast
  toast: Toast = { message: '', type: 'success', visible: false };
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private svc: AgentReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  loadReviews(): void {
    this.loadingReviews.set(true);
    this.reviewsError.set(null);
    this.svc.getPendingReviews(this.agentId)
      .pipe(finalize(() => this.loadingReviews.set(false)))
      .subscribe({
        next: (data) => this.attempts.set(data),
        error: (err) => {
          this.reviewsError.set(err.message ?? 'Failed to load reviews');
          this.showToast('Failed to load reviews', 'error');
        },
      });
  }

  onAgentIdChange(): void {
    this.loadReviews();
  }

  getStatus(a: QuizAttempt): 'pending' | 'passed' | 'failed' {
    if (a.passed === null) return 'pending';
    return a.passed ? 'passed' : 'failed';
  }

  getStudentName(a: QuizAttempt): string {
    return a.student?.name ?? `Student #${a.id}`;
  }

  getQuizTitle(a: QuizAttempt): string {
    return a.quiz?.title ?? `Quiz #${a.id}`;
  }

  getReviewerName(a: QuizAttempt): string {
    if (!a.reviewedBy) return '';
    return a.reviewedBy.name ?? `Agent #${a.reviewedBy.id}`;
  }

  scoreWidth(score: number | null): string {
    return `${score ?? 0}%`;
  }

  // ── Modal ──────────────────────────────────────────────────────────────────

  openModal(attempt: QuizAttempt): void {
    this.activeAttempt = attempt;
    this.selectedVerdict = null;
    this.finalScore = 75;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.activeAttempt = null;
    this.selectedVerdict = null;
  }

  selectVerdict(pass: boolean): void {
    this.selectedVerdict = pass;
  }

  canSubmit(): boolean {
    return this.selectedVerdict !== null && !this.submittingReview;
  }

  submitReview(): void {
    if (!this.activeAttempt || this.selectedVerdict === null) return;
    this.submittingReview = true;
    this.svc
      .reviewAttempt(this.activeAttempt.id, this.agentId, this.selectedVerdict, this.finalScore)
      .pipe(finalize(() => (this.submittingReview = false)))
      .subscribe({
        next: (res: ReviewResult) => {
          this.showToast(`✓ ${res.message} — Score: ${res.finalScore}`, 'success');
          this.closeModal();
          this.loadReviews();
        },
        error: (err) => this.showToast(err.message ?? 'Review failed', 'error'),
      });
  }

  // ── Assign ─────────────────────────────────────────────────────────────────

  submitAssign(): void {
    if (!this.questionId || !this.quizId) {
      this.showToast('Please fill in both Question ID and Quiz ID', 'error');
      return;
    }
    this.assignLoading = true;
    this.assignResult = null;
    this.svc
      .assignQuestion(this.questionId, this.quizId, this.agentId)
      .pipe(finalize(() => (this.assignLoading = false)))
      .subscribe({
        next: (res) => {
          this.assignResult = JSON.stringify(res, null, 2);
          this.showToast('Question assigned successfully!', 'success');
        },
        error: (err) => this.showToast(err.message ?? 'Assignment failed', 'error'),
      });
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  showToast(message: string, type: ToastType): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { message, type, visible: true };
    this.toastTimer = setTimeout(() => (this.toast.visible = false), 3200);
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  get tabTitle(): string {
    return this.activeTab === 'reviews' ? 'Pending Quiz Reviews' : 'Assign Question to Quiz';
  }
}