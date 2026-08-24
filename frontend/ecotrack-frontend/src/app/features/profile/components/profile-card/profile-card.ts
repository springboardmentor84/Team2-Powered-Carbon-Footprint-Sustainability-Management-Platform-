import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EditProfileDialog } from '../edit-profile-dialog/edit-profile-dialog';
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
  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);

  isUploading = false;

  user: any = {
    profileImage: 'https://ui-avatars.com/api/?name=User&background=2E7D32&color=fff&size=256',
    fullName: 'Loading...',
    email: 'Loading...',
    phone: 'N/A',
    gender: 'N/A',
    dateOfBirth: 'N/A',
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
    accountStatus: 'Active'
  };

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        if (profile) {
          this.user = {
            ...this.user,
            fullName: profile.fullName || 'N/A',
            email: profile.email || 'N/A',
            score: profile.ecoPoints !== undefined ? `${profile.ecoPoints}` : this.user.score,
            level: profile.currentLevel || profile.role || this.user.level,
            phone: profile.phone || 'N/A',
            gender: profile.gender || 'N/A',
            dateOfBirth: profile.dateOfBirth || 'N/A',
            location: profile.location || 'N/A',
            university: profile.university || 'N/A',
            department: profile.department || 'N/A',
            rollNumber: profile.rollNumber || 'N/A',
            year: profile.year || 'N/A',
            carbon: profile.totalEmissions !== undefined ? `${profile.totalEmissions} kg` : '0 kg',
            streak: profile.currentStreak !== undefined ? `${profile.currentStreak} Days` : '0 Days',
            joined: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A',
            accountStatus: profile.accountStatus || 'Active'
          };
          
          if (profile.profileImage) {
            this.user.profileImage = profile.profileImage;
          } else if (profile.fullName) {
             const nameQuery = profile.fullName.replace(/\\s+/g, '+');
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
  }

  editProfile(): void {
    this.dialog.open(EditProfileDialog, {
      width: '520px',
      data: { ...this.user }
    }).afterClosed().subscribe(result => {
      if (result) {
        // Send the updated profile to backend
        this.profileService.updateProfile(result).subscribe({
          next: (updatedProfile: UserProfile) => {
            this.user = { 
              ...this.user, 
              ...updatedProfile,
              dateOfBirth: updatedProfile.dateOfBirth || 'N/A',
              phone: updatedProfile.phone || 'N/A',
              gender: updatedProfile.gender || 'N/A',
              location: updatedProfile.location || 'N/A',
              university: updatedProfile.university || 'N/A',
              department: updatedProfile.department || 'N/A',
              rollNumber: updatedProfile.rollNumber || 'N/A',
              year: updatedProfile.year || 'N/A'
            };
            this.snackBar.open('Profile Updated Successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Failed to update profile', err);
            this.snackBar.open('Failed to update profile', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
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
