import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChallengeService } from '../../../../core/services/challenge.service';
import { Challenge } from '../../../../core/models/challenge.model';
import { finalize, debounceTime, distinctUntilChanged, take } from 'rxjs';
import { Page } from '../../../../core/services/admin.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-admin-challenges',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-challenges.html',
  styleUrl: './admin-challenges.css',
  providers: [DatePipe]
})
export class AdminChallenges implements OnInit {
  private challengeService = inject(ChallengeService);
  private fb = inject(FormBuilder);
  
  challenges = signal<Challenge[]>([]);
  totalElements = signal<number>(0);
  totalPages = signal<number>(0);

  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  filterForm: FormGroup;
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  currentSort = signal<string>('startDate,desc');

  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  challengeForm: FormGroup;

  showDetailsModal = signal<boolean>(false);
  selectedChallengeDetails = signal<any>(null);
  loadingDetails = signal<boolean>(false);

  constructor() {
    this.challengeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['PLASTIC_FREE', Validators.required],
      rewardPoints: [100, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      target: [0, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required]
    });

    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      startDate: [''],
      endDate: ['']
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadChallenges();
    });
  }

  ngOnInit() {
    this.loadChallenges();
  }

  loadChallenges() {
    this.loading.set(true);
    this.error.set(null);

    const filters = this.filterForm.value;

    this.challengeService.getAllChallenges(
      filters.search || undefined,
      filters.category || undefined,
      filters.startDate || undefined,
      filters.endDate || undefined,
      this.currentPage(),
      this.pageSize(),
      this.currentSort()
    )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response: any) => {
          this.challenges.set(response.content || response);
          this.totalElements.set(response.totalElements || (response.content ? response.content.length : response.length));
          this.totalPages.set(response.totalPages || 1);
        },
        error: (err) => this.error.set(err.message || 'Failed to load challenges')
      });
  }

  changePage(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadChallenges();
    }
  }

  changeSort(sort: string) {
    this.currentSort.set(sort);
    this.loadChallenges();
  }
  
  openCreateModal() {
    this.challengeForm.reset({
      category: 'PLASTIC_FREE',
      rewardPoints: 100,
      target: 0
    });
    this.showModal.set(true);
  }
  
  closeModal() {
    this.showModal.set(false);
  }
  
  onSubmit() {
    if (this.challengeForm.invalid) return;
    
    this.isSubmitting.set(true);
    
    // Format dates for backend
    const formData = { ...this.challengeForm.value };
    if (formData.startDate) formData.startDate = `${formData.startDate}T00:00:00`;
    if (formData.endDate) formData.endDate = `${formData.endDate}T23:59:59`;

    this.challengeService.createChallenge(formData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadChallenges();
        },
        error: (err) => alert(err.message || 'Failed to create challenge')
      });
  }

  viewChallengeDetails(id: number) {
    this.showDetailsModal.set(true);
    this.loadingDetails.set(true);
    this.selectedChallengeDetails.set(null);
    
    this.challengeService.getChallengeById(id)
      .pipe(finalize(() => this.loadingDetails.set(false)))
      .subscribe({
        next: (details) => this.selectedChallengeDetails.set(details),
        error: (err) => alert(err.message || 'Failed to load challenge details')
      });
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
  }

  private getExportData(callback: (challenges: Challenge[]) => void) {
    const filters = this.filterForm.value;
    
    this.challengeService.getAllChallenges(
      filters.search || undefined,
      filters.category || undefined,
      filters.startDate || undefined,
      filters.endDate || undefined,
      0, // fetch page 0
      10000, // fetch up to 10000 for export
      this.currentSort()
    ).pipe(take(1)).subscribe({
      next: (response: any) => {
        const items = response.content || response;
        callback(items);
      },
      error: () => alert('Failed to fetch data for export')
    });
  }

  exportCSV() {
    this.getExportData((challenges) => {
      const headers = ['ID', 'Title', 'Category', 'Start Date', 'End Date', 'Reward', 'Target'];
      const rows = challenges.map(c => [
        c.id, 
        `"${c.title}"`, 
        c.category, 
        c.startDate, 
        c.endDate, 
        c.rewardPoints, 
        `${c.target} ${c.unit}`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "ecotrack_challenges_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  exportPDF() {
    this.getExportData((challenges) => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('EcoTrack Challenges Report', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 30);
      
      const headers = [['ID', 'Title', 'Category', 'Start', 'End', 'Reward', 'Target']];
      const data = challenges.map(c => [
        c.id,
        c.title,
        c.category,
        this.formatDate(c.startDate),
        this.formatDate(c.endDate),
        c.rewardPoints,
        `${c.target} ${c.unit}`
      ]);

      autoTable(doc, {
        startY: 36,
        head: headers,
        body: data,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [46, 125, 50] } // EcoTrack green theme
      });

      doc.save('ecotrack_challenges_report.pdf');
    });
  }

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  }
}
