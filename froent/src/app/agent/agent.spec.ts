import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AgentReviewComponent } from './agent';
import { AgentReviewService } from './agent-review.service';
import { ChatService } from './chat.service';

describe('AgentReviewComponent', () => {
  let component: AgentReviewComponent;
  let fixture: ComponentFixture<AgentReviewComponent>;
  let agentReviewServiceSpy: jasmine.SpyObj<AgentReviewService>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    // Create mocks for the services
    agentReviewServiceSpy = jasmine.createSpyObj('AgentReviewService', ['getPendingReviews', 'reviewAttempt', 'assignQuestion']);
    chatServiceSpy = jasmine.createSpyObj('ChatService', ['getConversation', 'sendMessage', 'markAsSeen', 'getUnreadMessages']);

    // Return default values to avoid errors during ngOnInit
    agentReviewServiceSpy.getPendingReviews.and.returnValue(of([]));
    chatServiceSpy.getUnreadMessages.and.returnValue(of([]));
    chatServiceSpy.getConversation.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AgentReviewComponent],
      providers: [
        { provide: AgentReviewService, useValue: agentReviewServiceSpy },
        { provide: ChatService, useValue: chatServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
