import { ApplicationRef, DoBootstrap, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // ← correct

import { AppComponent } from './app.component';
import { StudentProfileComponent } from '../student/student.component';
import { routes } from './app.routes';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpClientModule, // ← correct
    AppComponent,
    StudentProfileComponent
  ],
  providers: []
})
export class AppModule implements DoBootstrap {
  ngDoBootstrap(_appRef: ApplicationRef): void {}
}
