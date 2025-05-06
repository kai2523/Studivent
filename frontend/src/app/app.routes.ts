import { Routes } from '@angular/router';
import { EventsComponent } from './pages/events/events.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
    { path: '', redirectTo: '/event', pathMatch: 'full' },
    { path: 'event', component: EventsComponent },
    { path: 'profile', component: ProfileComponent }
  ];

