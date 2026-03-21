import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from './chat-message.model';

@Injectable({ providedIn: 'root' })
export class ChatService {

  private readonly base = 'http://localhost:8080/api/chat';

  constructor(private http: HttpClient) {}

  // POST /api/chat?senderId=&receiverId=&message=
  sendMessage(senderId: number, receiverId: number, message: string): Observable<ChatMessage> {
    const params = new HttpParams()
      .set('senderId', senderId)
      .set('receiverId', receiverId)
      .set('message', message);
    return this.http.post<ChatMessage>(this.base, null, { params });
  }

  // GET /api/chat/conversation?user1Id=&user2Id=
  getConversation(user1Id: number, user2Id: number): Observable<ChatMessage[]> {
    const params = new HttpParams()
      .set('user1Id', user1Id)
      .set('user2Id', user2Id);
    return this.http.get<ChatMessage[]>(`${this.base}/conversation`, { params });
  }

  // PUT /api/chat/{id}/seen
  markAsSeen(id: number): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.base}/${id}/seen`, null);
  }

  // GET /api/chat/unread/{userId}
  getUnreadMessages(userId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.base}/unread/${userId}`);
  }
}