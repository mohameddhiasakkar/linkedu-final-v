export interface Destination {
  id?: number;
  countryName: string;
  description: string;
  paragraph?: string;
  imageUrl?: string;
  routeSlug: string;
  offers?: string[];
  universities?: string[];
}