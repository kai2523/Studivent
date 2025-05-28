import { Routes } from '@angular/router';
import { EventsComponent } from './pages/events/events.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { HelpComponent } from './pages/help/help.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { QrCodeComponent } from './pages/qr-code/qr-code.component';
import { ImpressumComponent } from './pages/impressum/impressum.component';

export const routes: Routes = [
    { path: '', redirectTo: '/event', pathMatch: 'full' },
    { path: 'event', component: EventsComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'help', component: HelpComponent },
    { path: 'terms-of-service', component: TermsOfServiceComponent },
    { path: 'impressum', component: ImpressumComponent },
    { path: 'qr-code', component: QrCodeComponent }
  ];

