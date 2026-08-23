import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService, AdminUser, AdminUserDetails, Page } from '../../../../core/services/admin.service';
import { finalize, debounceTime, distinctUntilChanged, take } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
  providers: [DatePipe]
})
export class AdminUsers implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  
  users = signal<AdminUser[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);
  
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  filterForm: FormGroup;
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  currentSort = signal<string>('createdAt,desc');

  // User Details Modal
  showDetailsModal = signal<boolean>(false);
  selectedUserDetails = signal<AdminUserDetails | null>(null);
  loadingDetails = signal<boolean>(false);

  constructor() {
    this.filterForm = this.fb.group({
      search: [''],
      role: [''],
      active: [''],
      startDate: [''],
      endDate: ['']
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadUsers();
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    
    const filters = this.filterForm.value;
    const activeFilter = filters.active === 'true' ? true : filters.active === 'false' ? false : undefined;

    this.adminService.getAllUsers(
      filters.search || undefined,
      filters.role || undefined,
      activeFilter,
      filters.startDate || undefined,
      filters.endDate || undefined,
      this.currentPage(),
      this.pageSize(),
      this.currentSort()
    )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (page: Page<AdminUser>) => {
          this.users.set(page.content);
          this.totalElements.set(page.totalElements);
          this.totalPages.set(page.totalPages);
        },
        error: (err) => this.error.set(err.message || 'Failed to load users')
      });
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  changeSort(sort: string) {
    this.currentSort.set(sort);
    this.loadUsers();
  }

  viewUserDetails(id: number) {
    this.showDetailsModal.set(true);
    this.loadingDetails.set(true);
    this.selectedUserDetails.set(null);
    
    this.adminService.getUserById(id)
      .pipe(finalize(() => this.loadingDetails.set(false)))
      .subscribe({
        next: (details) => this.selectedUserDetails.set(details),
        error: (err) => alert(err.message || 'Failed to load user details')
      });
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
  }

  private getExportData(callback: (users: AdminUser[]) => void) {
    const filters = this.filterForm.value;
    const activeFilter = filters.active === 'true' ? true : filters.active === 'false' ? false : undefined;
    
    this.adminService.getAllUsers(
      filters.search || undefined,
      filters.role || undefined,
      activeFilter,
      filters.startDate || undefined,
      filters.endDate || undefined,
      0, // fetch page 0
      10000, // fetch up to 10000 users for export
      this.currentSort()
    ).pipe(take(1)).subscribe({
      next: (page) => callback(page.content),
      error: () => alert('Failed to fetch data for export')
    });
  }

  exportCSV() {
    this.getExportData((users) => {
      const headers = ['ID', 'Name', 'Email', 'Role', 'EcoPoints', 'Status', 'Joined Date'];
      const rows = users.map(u => [
        u.id, 
        `"${u.fullName}"`, 
        u.email, 
        u.role, 
        u.ecoPoints, 
        u.active ? 'Active' : 'Inactive', 
        this.formatDate(u.createdAt)
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "ecotrack_users_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  exportPDF() {
    this.getExportData((users) => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('EcoTrack User Management Report', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 30);
      
      const headers = [['ID', 'Name', 'Email', 'Role', 'EcoPoints', 'Status', 'Joined']];
      const data = users.map(u => [
        u.id,
        u.fullName,
        u.email,
        u.role,
        u.ecoPoints,
        u.active ? 'Active' : 'Inactive',
        this.formatDate(u.createdAt)
      ]);

      autoTable(doc, {
        startY: 36,
        head: headers,
        body: data,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [46, 125, 50] } // EcoTrack green theme
      });

      doc.save('ecotrack_users_report.pdf');
    });
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  }
}
