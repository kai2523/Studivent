import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any | null = null;
  loading = false;
  error: string | null = null;

  emailUpdates = false;
  isAdmin = false;

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.userService.getUser().subscribe({
      next: u => {
        this.user = u;
        this.loading = false;
      },
      error: err => {
        console.error('Fehler beim Laden des Users', err);
        this.error = 'Benutzerdaten konnten nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }

  toggleEmailUpdates() {
    this.emailUpdates = !this.emailUpdates;
    console.log('Email-Updates:', this.emailUpdates);
    // TODO: persist e.g. this.userService.updatePreferences(...)
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: err => {
        console.error('Logout failed', err);
      }
    });
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
