import {
  Component, OnInit, OnDestroy,
  signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Subscription, interval, firstValueFrom } from 'rxjs';

import { AgentReviewService, QuizAttempt, ReviewResult } from './agent-review.service';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat-message.model';
// ── Types ──────────────────────────────────────────────────────────────────

type Tab = 'reviews' | 'assign' | 'chat';
type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
  visible: boolean;
}

export interface ChatContact {
  userId: number;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-agent-review',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './agent-review.component.html',
  styleUrls: ['./agent-review.component.css'],
})
export class AgentReviewComponent implements OnInit, OnDestroy {

  // ── Shared ─────────────────────────────────────────────────────────────────
  activeTab: Tab = 'reviews';
  agentId = 1;

  // ── Reviews ────────────────────────────────────────────────────────────────
  attempts       = signal<QuizAttempt[]>([]);
  loadingReviews = signal(false);
  reviewsError   = signal<string | null>(null);

  pendingCount = computed(() => this.attempts().filter(a => a.passed === null).length);
  passedCount  = computed(() => this.attempts().filter(a => a.passed === true).length);
  failedCount  = computed(() => this.attempts().filter(a => a.passed === false).length);

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOpen        = false;
  activeAttempt: QuizAttempt | null = null;
  selectedVerdict: boolean | null   = null;
  finalScore       = 75;
  submittingReview = false;

  // ── Assign ─────────────────────────────────────────────────────────────────
  questionId: number | null = null;
  quizId: number | null     = null;
  assignLoading = false;
  assignResult: string | null = null;

  // ── Chat ───────────────────────────────────────────────────────────────────
  receiverId: number | null = null;
  receiverIdInput = '';

  messages       = signal<ChatMessage[]>([]);
  loadingChat    = signal(false);
  sendingMessage = false;
  newMessage     = '';

  unreadMessages = signal<ChatMessage[]>([]);
  unreadCount    = computed(() => this.unreadMessages().length);

  contacts: ChatContact[] = [];

  private pollSub: Subscription | null   = null;
  private unreadSub: Subscription | null = null;
  private readonly POLL_MS = 8000;

  // ── Toast ──────────────────────────────────────────────────────────────────
  toast: Toast = { message: '', type: 'success', visible: false };
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor(
    private svc: AgentReviewService,
    private chatSvc: ChatService,
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.startUnreadPoll();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.unreadSub?.unsubscribe();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TABS
  // ══════════════════════════════════════════════════════════════════════════

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'chat' && this.receiverId) {
      this.loadConversation();
      this.startConversationPoll();
    } else {
      this.stopConversationPoll();
    }
  }

  get tabTitle(): string {
    const map: Record<Tab, string> = {
      reviews: 'Pending Quiz Reviews',
      assign:  'Assign Question to Quiz',
      chat:    'Chat',
    };
    return map[this.activeTab];
  }

  onAgentIdChange(): void {
    this.loadReviews();
    this.loadUnread();
    if (this.receiverId) this.loadConversation();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // REVIEWS
  // ══════════════════════════════════════════════════════════════════════════

  loadReviews(): void {
    this.loadingReviews.set(true);
    this.reviewsError.set(null);
    this.svc.getPendingReviews(this.agentId)
      .pipe(finalize(() => this.loadingReviews.set(false)))
      .subscribe({
        next:  data => this.attempts.set(data),
        error: err  => {
          this.reviewsError.set(err.message ?? 'Failed to load reviews');
          this.showToast('Failed to load reviews', 'error');
        },
      });
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

  // ══════════════════════════════════════════════════════════════════════════
  // MODAL
  // ══════════════════════════════════════════════════════════════════════════

  openModal(attempt: QuizAttempt): void {
    this.activeAttempt   = attempt;
    this.selectedVerdict = null;
    this.finalScore      = 75;
    this.modalOpen       = true;
  }

  closeModal(): void {
    this.modalOpen       = false;
    this.activeAttempt   = null;
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
        next:  (res: ReviewResult) => {
          this.showToast(`✓ ${res.message} — Score: ${res.finalScore}`, 'success');
          this.closeModal();
          this.loadReviews();
        },
        error: err => this.showToast(err.message ?? 'Review failed', 'error'),
      });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ASSIGN
  // ══════════════════════════════════════════════════════════════════════════

  submitAssign(): void {
    if (!this.questionId || !this.quizId) {
      this.showToast('Please fill in both Question ID and Quiz ID', 'error');
      return;
    }
    this.assignLoading = true;
    this.assignResult  = null;
    this.svc
      .assignQuestion(this.questionId, this.quizId, this.agentId)
      .pipe(finalize(() => (this.assignLoading = false)))
      .subscribe({
        next:  res => {
          this.assignResult = JSON.stringify(res, null, 2);
          this.showToast('Question assigned successfully!', 'success');
        },
        error: err => this.showToast(err.message ?? 'Assignment failed', 'error'),
      });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CHAT
  // ══════════════════════════════════════════════════════════════════════════

  onReceiverIdChange(): void {
    const parsed = parseInt(this.receiverIdInput, 10);
    if (isNaN(parsed) || parsed < 1) return;
    this.receiverId = parsed;
    this.upsertContact(parsed);
    this.loadConversation();
    this.startConversationPoll();
  }

  loadConversation(): void {
    if (!this.receiverId) return;
    this.loadingChat.set(true);

    Promise.all([
      firstValueFrom(this.chatSvc.getConversation(this.agentId, this.receiverId)).catch(() => [] as ChatMessage[]),
      firstValueFrom(this.chatSvc.getConversation(this.receiverId, this.agentId)).catch(() => [] as ChatMessage[]),
    ]).then(([dir1, dir2]) => {
      const all = [...(dir1 ?? []), ...(dir2 ?? [])];
      const map = new Map<number, ChatMessage>();
      all.forEach(m => map.set(m.id, m));
      const sorted = [...map.values()].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      this.messages.set(sorted);
      this.markIncomingAsSeen(sorted);
      this.updateContactPreview(this.receiverId!, sorted);
      this.loadingChat.set(false);
    });
  }

  private markIncomingAsSeen(msgs: ChatMessage[]): void {
    msgs
      .filter(m => !m.seen && m.receiver?.id === this.agentId)
      .forEach(m => this.chatSvc.markAsSeen(m.id).subscribe({ error: () => {} }));
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || !this.receiverId || this.sendingMessage) return;

    this.sendingMessage = true;
    this.chatSvc.sendMessage(this.agentId, this.receiverId, text)
      .pipe(finalize(() => (this.sendingMessage = false)))
      .subscribe({
        next: msg => {
          this.newMessage = '';
          this.messages.update(prev => [...prev, msg]);
          this.loadConversation();
        },
        error: () => this.showToast('Failed to send message', 'error'),
      });
  }

  onComposeKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  loadUnread(): void {
    this.chatSvc.getUnreadMessages(this.agentId).subscribe({
      next:  msgs => this.unreadMessages.set(msgs),
      error: ()   => {},
    });
  }

  isMine(msg: ChatMessage): boolean {
    return msg.sender?.id === this.agentId;
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDay(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString();
  }

  isNewDay(msgs: ChatMessage[], index: number): boolean {
    if (index === 0) return true;
    return this.formatDay(msgs[index].timestamp) !== this.formatDay(msgs[index - 1].timestamp);
  }

  initials(userId: number): string {
    return 'U' + userId;
  }

  // ── Contacts ───────────────────────────────────────────────────────────────

  private upsertContact(userId: number): void {
    if (!this.contacts.find(c => c.userId === userId)) {
      this.contacts = [{ userId, lastMessage: '…', lastTime: '', unreadCount: 0 }, ...this.contacts];
    }
  }

  private updateContactPreview(userId: number, msgs: ChatMessage[]): void {
    const contact = this.contacts.find(c => c.userId === userId);
    if (!contact || !msgs.length) return;
    const last = msgs[msgs.length - 1];
    contact.lastMessage = (last.message ?? '').length > 30
      ? last.message.substring(0, 30) + '…'
      : last.message ?? '';
    contact.lastTime    = this.formatTime(last.timestamp);
    contact.unreadCount = msgs.filter(m => !m.seen && m.receiver?.id === this.agentId).length;
  }

  selectContact(userId: number): void {
    this.receiverIdInput = String(userId);
    this.receiverId      = userId;
    this.upsertContact(userId);
    this.loadConversation();
    this.startConversationPoll();
  }

  isActiveContact(userId: number): boolean {
    return this.receiverId === userId;
  }

  // ── Polling ────────────────────────────────────────────────────────────────

  private startConversationPoll(): void {
    this.stopConversationPoll();
    this.pollSub = interval(this.POLL_MS).subscribe(() => {
      if (this.activeTab === 'chat' && this.receiverId) this.loadConversation();
    });
  }

  private stopConversationPoll(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  private startUnreadPoll(): void {
    this.loadUnread();
    this.unreadSub = interval(this.POLL_MS).subscribe(() => this.loadUnread());
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  showToast(message: string, type: ToastType): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { message, type, visible: true };
    this.toastTimer = setTimeout(() => (this.toast.visible = false), 3200);
  }
}