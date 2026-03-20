import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { DestinationsComponent } from '../destinations/destinations.component';

// 🌍 Components لكل دولة
import { AllemagneComponent } from '../destinations/pays/allemagne.component';
import { BelgiqueComponent } from '../destinations/pays/belgique.component';
import { ChineComponent } from '../destinations/pays/chine.component';
import { DubaiComponent } from '../destinations/pays/dubai.component';
import { EspagneComponent } from '../destinations/pays/espagne.component';
import { FranceComponent } from '../destinations/pays/france.component';
import { GeorgieComponent } from '../destinations/pays/georgie.component';
import { ItalieComponent } from '../destinations/pays/italie.component';
import { MalteComponent } from '../destinations/pays/malte.component';
import { RomanieComponent } from '../destinations/pays/romanie.component';
import { SuisseComponent } from '../destinations/pays/suisse.component';
import { TurkiyeComponent } from '../destinations/pays/turkiye.component';

// باقي الصفحات
import { ServicesComponent } from '../services/services.component';
import { BlogsComponent } from '../blogs/blogs.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { AdminComponent } from '../admin/admin.component';
import { TicketComponent } from '../ticket/ticket.component';
import { StudentProfileComponent } from '../student/student.component';
import { SignupComponent } from '../signup/signup.component';
import { LoginComponent } from '../login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'destinations', component: DestinationsComponent },

  // 🌍 Routes لكل دولة
  { path: 'destinations/pays/france', component: FranceComponent },
  { path: 'destinations/pays/romanie', component: RomanieComponent },
  { path: 'destinations/pays/dubai', component: DubaiComponent },
  { path: 'destinations/pays/italie', component: ItalieComponent },
  { path: 'destinations/pays/turkiye', component: TurkiyeComponent },
  { path: 'destinations/pays/espagne', component: EspagneComponent },
  { path: 'destinations/pays/belgique', component: BelgiqueComponent },
  { path: 'destinations/pays/allemagne', component: AllemagneComponent },
  { path: 'destinations/pays/chine', component: ChineComponent },
  { path: 'destinations/pays/suisse', component: SuisseComponent },
  { path: 'destinations/pays/georgie', component: GeorgieComponent },
  { path: 'destinations/pays/malte', component: MalteComponent },

  // باقي الصفحات
  { path: 'services', component: ServicesComponent },
  { path: 'blogs', component: BlogsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'ticket', component: TicketComponent },
  { path: 'student', component: StudentProfileComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  { path: '**', redirectTo: '' } // fallback
];