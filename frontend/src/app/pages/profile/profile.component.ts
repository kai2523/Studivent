import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  // Constructor goes here
  constructor(private router: Router) {}
  
  goToEvents() {
    this.router.navigate(['/events']);
  }

}
