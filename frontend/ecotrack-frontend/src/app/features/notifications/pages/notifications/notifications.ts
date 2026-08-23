import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService, NotificationResponse } from '../../../../core/services/notification';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  notifications: NotificationResponse[] = [];
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = false;
    this.notificationService.getNotifications()
    .pipe(finalize(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }))
    .subscribe({
      next: (data) => {
        this.notifications = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.error = true;
        this.cdr.detectChanges();
      }
    });
  }

  markAsRead(notification: NotificationResponse): void {
    if (notification.isRead) return;
    
    // Optimistic update
    notification.isRead = true;
    this.cdr.detectChanges();
    
    this.notificationService.markAsRead(notification.id).subscribe({
      error: (err) => {
        console.error('Failed to mark as read', err);
        notification.isRead = false; // Revert
        this.cdr.detectChanges();
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteNotification(id: number): void {
    const prevList = [...this.notifications];
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.cdr.detectChanges();
    
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.snackBar.open('Notification deleted', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to delete notification', err);
        this.notifications = prevList; // Revert
        this.cdr.detectChanges();
        this.snackBar.open('Failed to delete notification', 'Close', { duration: 3000 });
      }
    });
  }

  getIconForNotification(title: string): string {
    if (!title) return 'notifications';
    const t = title.toLowerCase();
    if (t.includes('reward')) return 'card_giftcard';
    if (t.includes('badge')) return 'military_tech';
    if (t.includes('challenge')) return 'emoji_events';
    if (t.includes('eco point') || t.includes('points')) return 'stars';
    if (t.includes('goal')) return 'flag';
    return 'notifications';
  }
}
