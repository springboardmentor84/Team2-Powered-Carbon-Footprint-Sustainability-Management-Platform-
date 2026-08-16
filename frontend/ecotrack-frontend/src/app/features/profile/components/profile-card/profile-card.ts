import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EditProfileDialog } from '../edit-profile-dialog/edit-profile-dialog';
import { environment } from '../../../../../environments/environment';
import { TOKEN_KEY } from '../../../../core/constants/app.constants';
import { ProfileService, UserProfile } from '../../../../core/services/profile';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.css'
})
export class ProfileCard implements OnInit {

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  private profileService = inject(ProfileService);
  private dashboardService = inject(DashboardService);
  private cdr = inject(ChangeDetectorRef);

  isUploading = false;

  user: any = {
    profileImage: 'https://ui-avatars.com/api/?name=User&background=2E7D32&color=fff&size=256',
    fullName: 'Loading...',
    email: 'Loading...',
    phone: 'N/A',
    gender: 'N/A',
    dob: 'N/A',
    location: 'N/A',
    university: 'N/A',
    department: 'N/A',
    rollNumber: 'N/A',
    year: 'N/A',
    level: 'N/A',
    carbon: '0 kg',
    streak: '0 Days',
    score: '0',
    joined: 'N/A',
    username: 'N/A',
    accountStatus: 'N/A',
    lastLogin: 'N/A'
  };

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        if (profile) {
          // Merge fetched profile data with existing fallback
          this.user = {
            ...this.user,
            fullName: profile.fullName || 'N/A',
            email: profile.email || 'N/A',
            score: profile.ecoPoints !== undefined ? `${profile.ecoPoints}` : this.user.score,
            level: profile.nextLevel || profile.role || this.user.level
          };
          
          if (profile.profileImage) {
            this.user.profileImage = profile.profileImage;
          } else if (profile.fullName) {
             const nameQuery = profile.fullName.replace(/\s+/g, '+');
             this.user.profileImage = `https://ui-avatars.com/api/?name=${nameQuery}&background=2E7D32&color=fff&size=256`;
          }
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Failed to load profile card data', err);
        this.user.fullName = 'Error loading';
        this.user.email = 'Error loading';
        this.cdr.detectChanges();
      }
    });

    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        if (summary) {
          this.user.carbon = `${summary.totalCarbonEmission || 0} kg`;
          this.user.streak = `${summary.currentStreak || 0} Days`;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Failed to load dashboard summary for profile', err)
    });
  }

  editProfile(): void {
    this.dialog.open(EditProfileDialog, {
      width: '520px',
      data: { ...this.user }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.user = { ...this.user, ...result };
        this.snackBar.open('Profile Updated Successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      this.user.profileImage = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.isUploading = true;

    this.profileService.uploadProfileImage(file).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        if (response?.profileImage) {
          this.user.profileImage = response.profileImage;
        }
        this.snackBar.open('Profile picture updated successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: () => {
        this.isUploading = false;
        this.snackBar.open('Failed to upload image. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
