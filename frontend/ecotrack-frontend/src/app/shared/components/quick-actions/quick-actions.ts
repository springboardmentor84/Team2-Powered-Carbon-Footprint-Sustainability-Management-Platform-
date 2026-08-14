import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  MatCardModule
} from '@angular/material/card';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  AddActivityDialog
} from '../../../features/activities/components/add-activity-dialog/add-activity-dialog';

@Component({
  selector: 'app-quick-actions',

  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule
  ],

  templateUrl:
    './quick-actions.html',

  styleUrl:
    './quick-actions.css'
})
export class QuickActions {

  private readonly router =
    inject(Router);

  private readonly dialog =
    inject(MatDialog);

  actions = [

    {
      title: 'Add Activity',
      icon: 'add_circle',
      route: '/dashboard/activities',
      color: '#2E7D32'
    },

    {
      title: 'Reports',
      icon: 'bar_chart',
      route: '/dashboard/reports',
      color: '#1565C0'
    },

    {
      title: 'Goals',
      icon: 'flag',
      route: '/dashboard/goals',
      color: '#FB8C00'
    },

    {
      title: 'Leaderboard',
      icon: 'emoji_events',
      route: '/dashboard/leaderboard',
      color: '#8E24AA'
    },

    {
      title: 'Profile',
      icon: 'person',
      route: '/dashboard/profile',
      color: '#00897B'
    },

    {
      title: 'Settings',
      icon: 'settings',
      route: '/dashboard/settings',
      color: '#546E7A'
    }

  ];

  actionClick(action: any): void {

    if (
      action.title ===
      'Add Activity'
    ) {

      this.dialog.open(
        AddActivityDialog,
        {
          width: '500px',
          maxWidth: '95vw',
          autoFocus: false
        }
      );

      return;

    }

    this.router.navigateByUrl(
      action.route
    );

  }

}
