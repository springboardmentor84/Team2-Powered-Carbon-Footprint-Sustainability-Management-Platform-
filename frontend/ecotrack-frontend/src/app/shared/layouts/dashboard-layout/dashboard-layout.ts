import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { RouterOutlet } from '@angular/router';

import {
  MatSidenavModule
} from '@angular/material/sidenav';

import {
  BreakpointObserver,
  Breakpoints
} from '@angular/cdk/layout';

import {
  Subscription
} from 'rxjs';

import { Header }
  from '../../components/header/header';

import { Sidebar }
  from '../../components/sidebar/sidebar';

import { Footer }
  from '../../components/footer/footer';

import { LayoutService } from '../../../core/services/layout/layout.service';


@Component({
  selector: 'app-dashboard-layout',

  standalone: true,

  imports: [
    RouterOutlet,
    MatSidenavModule,

    Header,
    Sidebar,
    Footer
  ],

  templateUrl: './dashboard-layout.html',

  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout
  implements OnInit, OnDestroy {


  private readonly breakpointObserver =
    inject(BreakpointObserver);
  private readonly layoutService =
    inject(LayoutService);
  private readonly cdr =
    inject(ChangeDetectorRef);

  private breakpointSubscription?: Subscription;
  private layoutSubscription?: Subscription;

  isMobile = false;
  isSidebarCollapsed = false;


  ngOnInit(): void {

    this.breakpointSubscription =
      this.breakpointObserver
        .observe([
          Breakpoints.Handset,
          Breakpoints.Tablet
        ])
        .subscribe(result => {

          this.isMobile =
            result.matches;
          if (this.isMobile) {
            this.layoutService.setSidebarCollapsed(true);
          }
        });

    this.layoutSubscription =
      this.layoutService.isSidebarCollapsed$
        .subscribe(collapsed => {
          this.isSidebarCollapsed = collapsed;
          this.cdr.detectChanges();
        });
  }


  ngOnDestroy(): void {
    this.breakpointSubscription?.unsubscribe();
    this.layoutSubscription?.unsubscribe();
  }
}
