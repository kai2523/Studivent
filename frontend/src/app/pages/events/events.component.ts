import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToggleViewComponent } from '../../components/toggle-view/toggle-view.component';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [ToggleViewComponent, EventCardComponent, CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  // Constructor goes here
  constructor(
    private router: Router,
    private eventService: EventService
  ) {}

  events: any[] = [];

  ngOnInit(): void {
    this.eventService.fetchEvents().subscribe((data) => {
      this.events = data;
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  selectedTab: number = 0;

  get filteredEvents(): Event[] {
    return this.selectedTab === 1
      ? this.events.filter(event => event.booked)
      : this.events;
  }

  onTabChanged(tabIndex: number): void {
    this.selectedTab = tabIndex;
  }

}

