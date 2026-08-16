import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sidebarCollapsed = new BehaviorSubject<boolean>(false);
  isSidebarCollapsed$ = this.sidebarCollapsed.asObservable();

  toggleSidebar(): void {
    this.sidebarCollapsed.next(!this.sidebarCollapsed.value);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    if (this.sidebarCollapsed.value !== collapsed) {
      this.sidebarCollapsed.next(collapsed);
    }
  }
}
