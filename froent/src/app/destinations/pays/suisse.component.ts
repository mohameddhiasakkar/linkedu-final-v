import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-suisse',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './suisse.component.html',
})
export class SuisseComponent {}