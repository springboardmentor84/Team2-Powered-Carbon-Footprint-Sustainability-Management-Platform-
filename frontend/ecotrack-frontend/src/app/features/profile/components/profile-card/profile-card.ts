import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EditProfileDialog } from '../edit-profile-dialog/edit-profile-dialog';
import { environment } from '../../../../../environments/environment';
import { TOKEN_KEY } from '../../../../core/constants/app.constants';
import { ProfileService, UserProfile } from '../../../../core/services/profile';

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
    score: '0%',
    joined: 'N/A',
    username: 'N/A',
    accountStatus: 'N/A',
    lastLogin: 'N/A'
  };

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          // Merge fetched profile data with existing fallback
          this.user = {
            ...this.user,
            ...profile,
            carbon: profile.carbon !== undefined ? `${profile.carbon} kg` : this.user.carbon,
            streak: profile.streak !== undefined ? `${profile.streak} Days` : this.user.streak,
            score: profile.score !== undefined ? `${profile.score}%` : this.user.score,
          };
          
          if (!profile.profileImage && profile.fullName) {
             const nameQuery = profile.fullName.replace(/\s+/g, '+');
             this.user.profileImage = `https://ui-avatars.com/api/?name=${nameQuery}&background=2E7D32&color=fff&size=256`;
          }
        }
      },
      error: (err) => console.error('Failed to load profile card data', err)
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

    // Upload to backend (Cloudinary)
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      this.snackBar.open('Please login first', 'Close', { duration: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.isUploading = true;

    this.http.post<any>(
      `${environment.apiUrl}/user/profile/image`,
      formData,
      { headers }
    ).subscribe({
      next: (response) => {
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
