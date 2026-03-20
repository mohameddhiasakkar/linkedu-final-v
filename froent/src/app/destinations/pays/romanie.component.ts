import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-romanie',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './romanie.component.html',
})
export class RomanieComponent {}