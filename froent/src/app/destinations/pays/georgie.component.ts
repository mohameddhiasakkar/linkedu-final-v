import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-georgie',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './georgie.component.html',
})
export class GeorgieComponent {}