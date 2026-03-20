import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent {
  hasAccess = true;

  ticket = {
    id: 'TKT-2026-001',
    meetingTitle: 'LinkedU Career Counseling Session',
    meetingDate: 'February 15, 2026',
    meetingTime: '10:00 AM - 11:00 AM (UTC+1)',
    googleMeetLink: 'https://meet.google.com/abc-defg-hij',
    host: 'Tasnime Chouikh',
    description: 'One-on-one career counseling session to discuss your professional goals and internship opportunities.'
  };

  copyLink(): void {
    navigator.clipboard.writeText(this.ticket.googleMeetLink).then(() => {
      alert('Meeting link copied to clipboard!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = this.ticket.googleMeetLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Meeting link copied to clipboard!');
    });
  }

  joinMeeting(): void {
    window.open(this.ticket.googleMeetLink, '_blank');
  }
}
