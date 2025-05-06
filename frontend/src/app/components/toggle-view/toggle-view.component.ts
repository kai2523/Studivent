import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-view',
  imports: [CommonModule],
  templateUrl: './toggle-view.component.html',
  styleUrl: './toggle-view.component.scss'
})
export class ToggleViewComponent {
  activeTab: number = 0;

  @Output() tabChanged = new EventEmitter<number>();

  onTabClick(index: number) {
    this.activeTab = index;
    this.tabChanged.emit(this.activeTab);
  }

}


