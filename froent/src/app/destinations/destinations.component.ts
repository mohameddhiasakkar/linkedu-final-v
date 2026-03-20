import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Destination {
  countryName: string;
  description: string;
  imageUrl: string;
  routeSlug: string;
}

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './destinations.component.html',
  styleUrls: ['./destinations.component.css']
})
export class DestinationsComponent implements OnInit {

  destinations: Destination[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.http.get<Destination[]>('http://localhost:8080/api/destinations')
      .pipe(
        catchError(err => {
          console.error('Error fetching destinations', err);
          this.errorMessage = 'Impossible de charger les destinations.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(data => {
        this.destinations = data;
        this.isLoading = false;
      });
  }

  getPreposition(countryName: string): string {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const feminineCountries = ['belgique', 'chine', 'espagne', 'france', 'géorgie', 'italie', 'roumanie', 'suisse', 'turquie'];
    const startsWithVowel = vowels.includes(countryName.charAt(0).toLowerCase());

    if (feminineCountries.includes(countryName.toLowerCase()) || startsWithVowel) {
      return 'en';
    } else if (countryName.toLowerCase() === 'dubaï' || countryName.toLowerCase() === 'malte') {
      return 'à';
    } else {
      return 'au';
    }
  }

  getRouteSlug(destination: Destination): string {
    return destination.routeSlug;
  }
}