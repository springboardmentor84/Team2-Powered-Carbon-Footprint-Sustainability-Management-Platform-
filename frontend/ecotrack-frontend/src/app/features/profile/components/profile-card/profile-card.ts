import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EditProfileDialog } from '../edit-profile-dialog/edit-profile-dialog';
import { environment } from '../../../../../environments/environment';
import { TOKEN_KEY } from '../../../../core/constants/app.constants';

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
export class ProfileCard {

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  isUploading = false;

  user = {
    profileImage: 'https://ui-avatars.com/api/?name=Harshit+Rai&background=2E7D32&color=fff&size=256',
    fullName: 'Harshit Rai',
    email: 'harshit23btaml34@gmail.com',
    phone: '+91 9876543210',
    gender: 'Male',
    dob: '15 March 2004',
    location: 'Odisha, India',
    university: 'Sambalpur University Institute of Information Technology',
    department: 'Computer Science & Engineering',
    rollNumber: '23BTAML34',
    year: '3rd Year',
    level: 'Eco Champion',
    carbon: '128 kg',
    streak: '15 Days',
    score: '86%',
    joined: 'July 2026',
    username: 'harshitrai1602',
    accountStatus: 'Active',
    lastLogin: 'Today'
  };

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
