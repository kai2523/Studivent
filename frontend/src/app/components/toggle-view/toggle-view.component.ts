import {
  Component,
  EventEmitter,
  Output,
  ViewChildren,
  ViewChild,
  ElementRef,
  QueryList,
  AfterViewInit,
  Renderer2
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-view.component.html',
  styleUrls: ['./toggle-view.component.scss']
})
export class ToggleViewComponent implements AfterViewInit {
  @Output() tabChanged = new EventEmitter<number>();
  activeTab = 0;

  tabs = ['All Events', 'Booked Events'];

  @ViewChildren('tabRef') tabRefs!: QueryList<ElementRef>;
  @ViewChild('selectorRef') selectorRef!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.updateSelector(), 0);
  }

  onTabClick(index: number): void {
    this.activeTab = index;
    this.tabChanged.emit(index);
    this.updateSelector();
  }

  private updateSelector(): void {
    const tabsArray = this.tabRefs.toArray();
    const selector = this.selectorRef?.nativeElement;
    const activeEl = tabsArray[this.activeTab]?.nativeElement;

    if (!selector || !activeEl) return;

    const left = activeEl.offsetLeft;
    const width = activeEl.offsetWidth;

    this.renderer.setStyle(selector, 'left', `${left}px`);
    this.renderer.setStyle(selector, 'width', `${width}px`);
  }
}
