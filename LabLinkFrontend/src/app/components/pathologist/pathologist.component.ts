import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface TestResultForReview {
  orderItemId: number;
  testCode: string;
  testName: string;
  department: string;
  value: string;
  units: string;
  flag: string;
  minNormalValue: number;
  maxNormalValue: number;
  enteredBy: string;
  enteredDate: string;
}

interface OrderForReview {
  orderId: number;
  patientId: number;
  patientName: string;
  orderDate: string;
  priority: number;
  totalTests: number;
  completedResults: number;
  isReadyForReview: boolean;
  isReviewed: boolean;
}

interface OrderReviewDetail {
  orderId: number;
  patientId: number;
  patientName: string;
  patientDob: string;
  patientGender: string;
  orderDate: string;
  priority: number;
  testResults: TestResultForReview[];
  existingReview: any;
}

@Component({
  selector: 'app-pathologist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pathologist.component.html',
  styleUrl: './pathologist.component.css'
})
export class PathologistComponent implements OnInit {
  private readonly apiUrl = 'http://localhost:5290';
  
  orders: OrderForReview[] = [];
  filteredOrders: OrderForReview[] = [];
  selectedOrder: OrderReviewDetail | null = null;
  
  searchTerm = '';
  filterStatus = 'all';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Review form
  showReviewModal = false;
  reviewNotes = '';
  reviewStatus = 'Approved';
  isSubmitting = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Found' : 'NOT FOUND', token?.substring(0, 50));
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.http.get<{data: OrderForReview[]}>(`${this.apiUrl}/api/pathology/orders`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.orders = response.data || [];
          this.applyFilters();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load orders';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.patientName?.toLowerCase().includes(term) ||
        o.orderId.toString().includes(term)
      );
    }

    if (this.filterStatus !== 'all') {
      const status = this.filterStatus.toLowerCase();
      if (status === 'pending review') {
        filtered = filtered.filter(o => o.isReadyForReview && !o.isReviewed);
      } else if (status === 'reviewed') {
        filtered = filtered.filter(o => o.isReviewed);
      } else if (status === 'in progress') {
        filtered = filtered.filter(o => !o.isReadyForReview && !o.isReviewed);
      }
    }

    this.filteredOrders = filtered;
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  viewOrderDetails(orderId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.http.get<{data: OrderReviewDetail}>(`${this.apiUrl}/api/pathology/orders/${orderId}`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.selectedOrder = response.data;
          this.isLoading = false;
          
          // Pre-fill review form if existing review
          if (response.data.existingReview) {
            this.reviewNotes = response.data.existingReview.notes || '';
            this.reviewStatus = response.data.existingReview.status || 'Approved';
          } else {
            this.reviewNotes = '';
            this.reviewStatus = 'Approved';
          }
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load order details';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  backToList(): void {
    this.selectedOrder = null;
    this.cdr.detectChanges();
  }

  openReviewModal(): void {
    this.showReviewModal = true;
    this.cdr.detectChanges();
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.cdr.detectChanges();
  }

  submitReview(): void {
    if (!this.selectedOrder) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const reviewData = {
      orderId: this.selectedOrder.orderId,
      status: this.reviewStatus,
      notes: this.reviewNotes
    };

    const isUpdate = this.selectedOrder.existingReview != null;
    const url = isUpdate 
      ? `${this.apiUrl}/api/pathology/review/${this.selectedOrder.existingReview.reviewId}`
      : `${this.apiUrl}/api/pathology/review`;
    
    const request = isUpdate
      ? this.http.put(url, reviewData, { headers: this.getHeaders() })
      : this.http.post(url, reviewData, { headers: this.getHeaders() });

    request.subscribe({
      next: () => {
        this.successMessage = isUpdate ? 'Review updated successfully!' : 'Review submitted successfully!';
        this.isSubmitting = false;
        this.showReviewModal = false;
        
        // Refresh data
        this.loadOrders();
        this.viewOrderDetails(this.selectedOrder!.orderId);
        
        this.cdr.detectChanges();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Review submit error:', err);
        console.error('Status:', err.status);
        console.error('Error body:', err.error);
        this.errorMessage = err.error?.message || `Failed to submit review (${err.status})`;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFlagClass(flag: string): string {
    if (!flag) return '';
    const f = flag.toLowerCase();
    if (f === 'high' || f === 'critical high' || f === 'h') return 'flag-high';
    if (f === 'low' || f === 'critical low' || f === 'l') return 'flag-low';
    return 'flag-normal';
  }

  getPriorityText(priority: number): string {
    switch (priority) {
      case 1: return 'Routine';
      case 2: return 'Urgent';
      case 3: return 'STAT';
      default: return 'Unknown';
    }
  }

  getPriorityClass(priority: number | string): string {
    const p = typeof priority === 'number' ? priority : parseInt(priority, 10);
    if (p >= 2) return 'priority-urgent';
    return 'priority-routine';
  }

  getStatusText(order: OrderForReview): string {
    if (order.isReviewed) return 'Reviewed';
    if (order.isReadyForReview) return 'Pending Review';
    return 'In Progress';
  }

  getStatusClass(status: string | boolean): string {
    if (typeof status === 'boolean') {
      return status ? 'status-reviewed' : 'status-pending';
    }
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'reviewed' || s === 'approved') return 'status-reviewed';
    if (s === 'pending review') return 'status-pending';
    return 'status-progress';
  }

  getDetailStatusText(): string {
    if (!this.selectedOrder) return '';
    if (this.selectedOrder.existingReview) return 'Reviewed';
    const hasResults = this.selectedOrder.testResults?.some(t => t.value);
    return hasResults ? 'Pending Review' : 'In Progress';
  }

  getNormalRange(result: TestResultForReview): string {
    if (result.minNormalValue != null && result.maxNormalValue != null) {
      return `${result.minNormalValue} - ${result.maxNormalValue}`;
    }
    return 'N/A';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('roles');
    this.router.navigate(['/login']);
  }
}
