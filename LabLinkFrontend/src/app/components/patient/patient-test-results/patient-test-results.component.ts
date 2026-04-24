import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  TestResultService,
  LabOrderResponse,
  OrderItemResponse,
  ResultEntryResponse
} from '../../../services/test-result.service';
import { AuthService } from '../../../services/auth.service';

export interface ResultRow {
  result: ResultEntryResponse;
  department?: string | null;
}

export interface OrderView {
  order: LabOrderResponse;
  results: ResultRow[];
  expanded: boolean;
}

@Component({
  selector: 'app-patient-test-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-test-results.component.html',
  styleUrl: './patient-test-results.component.css'
})
export class PatientTestResultsComponent implements OnInit {
  orders: OrderView[] = [];
  isLoading = true;
  errorMessage = '';
  patientId: number | null = null;

  constructor(
    private testResultService: TestResultService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.patientId = Number(localStorage.getItem('patientId')) || null;
    if (this.patientId) {
      this.loadAll();
    } else {
      this.errorMessage = 'Patient profile not found. Please complete your profile first.';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadAll(): void {
    this.testResultService.getLabOrders(this.patientId!).subscribe({
      next: (res) => {
        const activeOrders = (res.data ?? [])
          .filter(o => o.isActive)
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        if (activeOrders.length === 0) {
          this.orders = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        
        const itemCalls = activeOrders.map(o =>
          this.testResultService.getOrderItems(o.orderId).pipe(
            catchError(() => of({ data: [] as OrderItemResponse[] }))
          )
        );

        forkJoin(itemCalls).subscribe({
          next: (itemSets) => {
         
            const allItems: { item: OrderItemResponse; orderIdx: number }[] = [];
            itemSets.forEach((set, i) =>
              (set.data ?? []).forEach(item => allItems.push({ item, orderIdx: i }))
            );

            if (allItems.length === 0) {
              this.orders = activeOrders.map(o => ({ order: o, results: [], expanded: true }));
              this.isLoading = false;
              this.cdr.detectChanges();
              return;
            }

            const resultCalls = allItems.map(({ item }) =>
              this.testResultService.getResults(item.orderItemId).pipe(
                catchError(() => of({ data: [] as ResultEntryResponse[] }))
              )
            );

            forkJoin(resultCalls).subscribe({
              next: (resultSets) => {
        
                const orderResultsMap = new Map<number, ResultRow[]>();
                activeOrders.forEach(o => orderResultsMap.set(o.orderId, []));

                allItems.forEach(({ item, orderIdx }, i) => {
                  const orderId = activeOrders[orderIdx].orderId;
                  const rows = orderResultsMap.get(orderId) ?? [];
                  (resultSets[i].data ?? []).forEach(r =>
                    rows.push({ result: r, department: item.department })
                  );
                  orderResultsMap.set(orderId, rows);
                });

                this.orders = activeOrders.map(o => ({
                  order: o,
                  results: orderResultsMap.get(o.orderId) ?? [],
                  expanded: true
                }));

                this.isLoading = false;
                this.cdr.detectChanges();
              }
            });
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.status === 403
          ? 'Access to lab orders is not yet enabled for patients. Please contact the lab.'
          : 'Failed to load test results. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleOrder(view: OrderView): void {
    view.expanded = !view.expanded;
    this.cdr.detectChanges();
  }


  flagBadgeClass(flag: string | null | undefined): string {
    if (!flag) return 'bg-secondary';
    const f = flag.toUpperCase();
    if (f === 'H' || f === 'HH') return 'bg-danger';
    if (f === 'L' || f === 'LL') return 'bg-primary';
    if (f === 'A') return 'bg-warning text-dark';
    if (f === 'N') return 'bg-success';
    return 'bg-secondary';
  }

  flagLabel(flag: string | null | undefined): string {
    if (!flag) return 'Normal';
    const map: Record<string, string> = {
      'H': 'High', 'HH': 'Critical High',
      'L': 'Low',  'LL': 'Critical Low',
      'A': 'Abnormal', 'N': 'Normal'
    };
    return map[flag.toUpperCase()] ?? flag;
  }

  priorityLabel(p: number): string {
    return p === 1 ? 'STAT' : p === 2 ? 'Urgent' : 'Routine';
  }

  priorityBadge(p: number): string {
    return p === 1 ? 'danger' : p === 2 ? 'warning text-dark' : 'secondary';
  }

  goBack(): void { this.router.navigate(['/patient']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
