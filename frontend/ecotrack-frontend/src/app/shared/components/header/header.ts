import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutService } from '../../../core/services/layout/layout.service';
import { ProfileService } from '../../../core/services/profile';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private layoutService = inject(LayoutService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileImage: string | null = null;
  initials: string = 'U';

  ngOnInit() {
    this.profileService.getProfile().subscribe(profile => {
      if (profile) {
        this.profileImage = profile.profileImage || null;
        if (profile.fullName) {
          this.initials = profile.fullName.charAt(0).toUpperCase();
        }
      }
    });
  }

  toggleSidebar() {
    this.layoutService.toggleSidebar();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']); 
  }
}
