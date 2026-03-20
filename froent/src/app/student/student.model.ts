export interface StudentProfile {
  id?: number;
  name: string;
  headline: string;
  profilePicture: string;
  countryFlagUrl: string;
  chosenCountry: string;
  timezone?: string;
  email: string;
  phoneNumber: string;
  location?: string;
  pays: string;
  skills: string[];
  education: Education[];
  experience?: Experience[];
  documents: Document[];
  socialLinks: SocialLink[];
  cvUrl: string;
  connections?: number;
  availability?: string;
  completionRate?: string;
}

export interface StudentProfileDTO {
  name: string;
  headline: string;
  profilePicture?: string;
  countryFlagUrl?: string;
  chosenCountry?: string;
  timezone?: string;
  email: string;
  phoneNumber: string;
  location?: string;
  pays?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  documents?: Document[];
  socialLinks?: SocialLink[];
  cvUrl?: string;
  availability?: string;
  completionRate?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
  description?: string;
}

export interface Experience {
  position: string;
  company: string;
  period: string;
  description: string;
  icon?: string;
}

export interface Document {
  name: string;
  type: 'pdf' | 'image' | 'doc';
  size: string;
  url: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
}

export interface Message {
  id: number;
  sender: string;
  senderInitials: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}