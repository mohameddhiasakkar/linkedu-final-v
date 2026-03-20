import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageInfo, PageService } from '../services/page.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent implements OnInit {
  pagesFromBackend: PageInfo[] = [];
  backendError = '';

  constructor(private readonly pageService: PageService) {}

  ngOnInit(): void {
    this.pageService.getPages().subscribe({
      next: (pages) => {
        this.pagesFromBackend = pages;
      },
      error: () => {
        this.backendError = 'Failed to load page list from backend.';
      }
    });
  }
}
