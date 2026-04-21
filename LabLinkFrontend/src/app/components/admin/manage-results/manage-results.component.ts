import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultEntryService, ResultEntryDto } from '../../../services/result-entry.service';

@Component({
  selector: 'app-manage-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-results.component.html',
  styleUrl: './manage-results.component.css'
})
export class ManageResultsComponent {
  results: ResultEntryDto[] = [];
  loading = false;
  error = '';

  searchOrderItemId: number | null = null;

  constructor(
    private resultEntryService: ResultEntryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  search(): void {
    if (!this.searchOrderItemId || this.searchOrderItemId <= 0) {
      this.error = 'Please enter a valid Order Item ID.';
      this.cdr.detectChanges();
      return;
    }
    this.loadResults();
  }

  clearSearch(): void {
    this.searchOrderItemId = null;
    this.results = [];
    this.error = '';
    this.cdr.detectChanges();
  }

  loadResults(): void {
    if (!this.searchOrderItemId) return;
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.resultEntryService.getByOrderItemId(this.searchOrderItemId).subscribe({
      next: (res) => {
        this.results = res.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.results = [];
        } else if (err.status === 401) {
          this.error = 'Session expired. Please log in again.';
        } else if (err.status === 403) {
          this.error = 'Access denied. You do not have permission to view results.';
        } else {
          this.error = err.error?.message || `Error ${err.status}: Failed to load results.`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
