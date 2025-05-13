import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-profile',
  standalone: true, // ✅ confirms it's standalone
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent // Optional if using Angular wrapper instead of CSS
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  // Constructor goes here
  user = {
    username: 'Max Mustermann',
    email: 'max.mustermann.22@heilbronn.dhbw.de'
  };

  emailUpdates = false;
  isAdmin = false;

  constructor(
    private location: Location,
    private router: Router
  ) {}

  goBack() {
    this.location.back();
  }

  toggleEmailUpdates() {
    // persist change
    console.log("Email Updates toggled!")
  }

  logout() {
    console.log("Logout!")
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
