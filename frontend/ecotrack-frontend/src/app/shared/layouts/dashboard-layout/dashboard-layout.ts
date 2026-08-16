import {
  Component,
  OnDestroy,
  OnInit,
  inject
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


  private breakpointSubscription?:
    Subscription;


  isMobile = false;


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

        });

  }


  ngOnDestroy(): void {

    this.breakpointSubscription
      ?.unsubscribe();

  }

}
