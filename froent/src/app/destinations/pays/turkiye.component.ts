import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-turkiye',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './turkiye.component.html',
})
export class TurkiyeComponent {}