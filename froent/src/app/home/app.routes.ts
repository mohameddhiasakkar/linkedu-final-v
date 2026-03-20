import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DestinationsComponent } from '../destinations/destinations.component';
import { ServicesComponent } from '../services/services.component';
import { BlogsComponent } from '../blogs/blogs.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { AdminComponent } from '../admin/admin.component';
import { TicketComponent } from '../ticket/ticket.component';
import { StudentProfileComponent } from '../student/student.component';
import { LoginComponent } from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { FranceComponent } from '../destinations/pays/france.component';
import { RomanieComponent } from '../destinations/pays/romanie.component';
import { DubaiComponent } from '../destinations/pays/dubai.component';
import { ItalieComponent } from '../destinations/pays/italie.component';
import { TurkiyeComponent } from '../destinations/pays/turkiye.component';
import { EspagneComponent } from '../destinations/pays/espagne.component';
import { BelgiqueComponent } from '../destinations/pays/belgique.component';
import { AllemagneComponent } from '../destinations/pays/allemagne.component';
import { ChineComponent } from '../destinations/pays/chine.component';
import { SuisseComponent } from '../destinations/pays/suisse.component';
import { GeorgieComponent } from '../destinations/pays/georgie.component';
import { MalteComponent } from '../destinations/pays/malte.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'destinations',
    children: [
      { path: '', component: DestinationsComponent, pathMatch: 'full' },
      { path: 'france', component: FranceComponent },
      { path: 'romanie', component: RomanieComponent },
      { path: 'dubai', component: DubaiComponent },
      { path: 'italie', component: ItalieComponent },
      { path: 'turkiye', component: TurkiyeComponent },
      { path: 'espagne', component: EspagneComponent },
      { path: 'belgique', component: BelgiqueComponent },
      { path: 'allemagne', component: AllemagneComponent },
      { path: 'chine', component: ChineComponent },
      { path: 'suisse', component: SuisseComponent },
      { path: 'georgie', component: GeorgieComponent },
      { path: 'malte', component: MalteComponent },
    ],
  },
  { path: 'services', component: ServicesComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'ticket', component: TicketComponent },
  { path: 'student', component: StudentProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' }
];