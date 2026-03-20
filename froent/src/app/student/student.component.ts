import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentProfile, Message, Document } from './student.model';
import { StudentProfileService } from './student.service';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentProfileComponent implements OnInit {

  student: StudentProfile | null = null;
  isLoading = true;
  errorMessage = '';

  newMessage: string = '';
  messages: Message[] = [];

  constructor(private studentProfileService: StudentProfileService) {}

  ngOnInit(): void {
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    this.isLoading = true;
    this.studentProfileService.getMyProfile().subscribe({
      next: (profile) => {
        this.student = profile;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Failed to load profile';
        this.isLoading = false;
        console.error('Profile load error:', err);
      }
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        sender: this.student?.name || 'Me',
        senderInitials: this.student?.name?.charAt(0) || 'M',
        content: this.newMessage,
        timestamp: new Date(),
        isOwn: true
      });
      this.newMessage = '';
    }
  }

  downloadDocument(doc: Document): void {
    window.open(doc.url, '_blank');
  }
}