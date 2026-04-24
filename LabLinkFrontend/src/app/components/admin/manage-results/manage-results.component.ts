import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultEntryService, LabOrderList, LabOrderDetail, OrderItemWithTest } from '../../../services/result-entry.service';

@Component({
  selector: 'app-manage-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-results.component.html',
  styleUrl: './manage-results.component.css'
})
export class ManageResultsComponent implements OnInit {
  allOrders: LabOrderList[] = [];
  filteredOrders: LabOrderList[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  // Detail view
  selectedOrder: LabOrderDetail | null = null;
  detailLoading = false;

  constructor(
    private resultEntryService: ResultEntryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    this.resultEntryService.getAllOrders().subscribe({
      next: (res: any) => {
        // handle both { data: [] } and plain array responses
        this.allOrders = Array.isArray(res) ? res : (res?.data ?? []);
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          this.error = 'Session expired — please log out and log back in.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Admin role required.';
        } else {
          this.error = err.error?.message || `Error ${err.status}: Failed to load orders.`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredOrders = term
      ? this.allOrders.filter(o =>
          (o.patientName ?? '').toLowerCase().includes(term) ||
          o.orderId.toString().includes(term)
        )
      : [...this.allOrders];
    this.cdr.detectChanges();
  }

  viewOrder(orderId: number): void {
    this.detailLoading = true;
    this.selectedOrder = null;
    this.error = '';
    this.cdr.detectChanges();
    this.resultEntryService.getOrderDetail(orderId).subscribe({
      next: (res: any) => {
        this.selectedOrder = res?.data ?? res;
        this.detailLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load order details.';
        this.detailLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  backToList(): void {
    this.selectedOrder = null;
    this.error = '';
    this.cdr.detectChanges();
  }

  completedResults(order: LabOrderList): number {
    return order.orderItemCount - order.pendingResultCount;
  }

  getFlagClass(flag: string | null): string {
    if (!flag) return 'flag-unknown';
    const f = flag.toLowerCase();
    if (f === 'normal') return 'flag-normal';
    if (f === 'high' || f === 'abnormal' || f === 'panic') return 'flag-abnormal';
    if (f === 'low') return 'flag-low';
    return 'flag-unknown';
  }

  resultsForItem(item: OrderItemWithTest): boolean {
    return !!item.existingResult;
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
