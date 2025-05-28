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
  events: any[] = [];
  selectedTab = 0;

  constructor(
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventService.fetchEvents().subscribe(data => {
      this.events = data;
      console.log(data)
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  onTabChanged(tabIndex: number): void {
    this.selectedTab = tabIndex;
  }

  /** 
   * Tab 0: all events  
   * Tab 1: only events with at least one ticket 
   */
  get filteredEvents(): any[] {
    if (this.selectedTab === 1) {
      return this.events.filter(
        e => Array.isArray(e.tickets) && e.tickets.length > 0
      );
    }
    return this.events;
  }
}
