import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../components/admin-sidebar/admin-sidebar';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebar, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  private authService = inject(AuthService);
  
  adminName: string = 'Admin';
  adminInitials: string = 'A';

  ngOnInit() {
    const user = this.authService.getUser();
    if (user && user.fullName) {
      this.adminName = user.fullName;
      this.adminInitials = this.getInitials(user.fullName);
    }
  }

  private getInitials(name: string): string {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
