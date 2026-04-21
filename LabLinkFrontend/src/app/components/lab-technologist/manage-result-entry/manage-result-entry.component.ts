import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResultEntryService, ResultEntry, ResultEntryCreateRequest, LabOrderList, LabOrderDetail, OrderItemWithTest } from '../../../services/result-entry.service';

@Component({
  selector: 'app-manage-result-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-result-entry.component.html',
  styleUrl: './manage-result-entry.component.css'
})
export class ManageResultEntryComponent implements OnInit {
  // Signals for orders list view
  orders = signal<LabOrderList[]>([]);
  searchOrderId = signal<string>('');
  
  // Computed signal for filtered orders
  filteredOrders = computed(() => {
    const search = this.searchOrderId().toLowerCase().trim();
    if (!search) {
      return this.orders();
    }
    return this.orders().filter(order => 
      order.orderId.toString().includes(search) ||
      (order.patientName && order.patientName.toLowerCase().includes(search))
    );
  });
  
  // Signals for order detail view
  selectedOrder = signal<LabOrderDetail | null>(null);
  selectedOrderItem = signal<OrderItemWithTest | null>(null);
  searchOrderItemId = signal<string>('');
  
  // Computed signal for filtered order items
  filteredOrderItems = computed(() => {
    const order = this.selectedOrder();
    if (!order) return [];
    
    const search = this.searchOrderItemId().toLowerCase().trim();
    if (!search) {
      return order.orderItems;
    }
    return order.orderItems.filter(item => 
      item.orderItemId.toString().includes(search) ||
      (item.testName && item.testName.toLowerCase().includes(search)) ||
      (item.testCode && item.testCode.toLowerCase().includes(search))
    );
  });
  
  // State signals
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  currentView = signal<'orders' | 'orderDetail' | 'resultEntry'>('orders');
  
  // Form state signal
  formData = signal<ResultEntryCreateRequest>({
    orderItemId: 0,
    testId: 0,
    analyte: '',
    value: '',
    units: '',
    source: 'Manual'
  });

  constructor(
    private resultEntryService: ResultEntryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);
    this.resultEntryService.getAllOrders().subscribe({
      next: (response) => {
        console.log('Orders response:', response);
        this.orders.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load orders');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  updateSearchOrderId(value: string): void {
    this.searchOrderId.set(value);
  }

  updateSearchOrderItemId(value: string): void {
    this.searchOrderItemId.set(value);
  }

  viewOrderDetail(order: LabOrderList): void {
    this.loading.set(true);
    this.error.set(null);
    this.searchOrderItemId.set('');
    
    this.resultEntryService.getOrderDetail(order.orderId).subscribe({
      next: (response) => {
        console.log('Order detail response:', response);
        this.selectedOrder.set(response.data);
        this.currentView.set('orderDetail');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load order details');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  enterResult(orderItem: OrderItemWithTest): void {
    this.selectedOrderItem.set(orderItem);
    
    // Auto-fill form with test information
    if (orderItem.hasResult && orderItem.existingResult) {
      // Edit existing result
      this.formData.set({
        orderItemId: orderItem.orderItemId,
        testId: orderItem.existingResult.testId,
        analyte: orderItem.existingResult.analyte,
        value: orderItem.existingResult.value,
        units: orderItem.existingResult.units,
        source: orderItem.existingResult.source
      });
    } else {
      // New result entry - auto-fill from test
      this.formData.set({
        orderItemId: orderItem.orderItemId,
        testId: orderItem.testId || 0,
        analyte: orderItem.testName || '',
        value: '',
        units: orderItem.units || '',
        source: 'Manual'
      });
    }
    this.currentView.set('resultEntry');
  }

  updateFormField(field: keyof ResultEntryCreateRequest, value: string | number): void {
    this.formData.update(current => ({ ...current, [field]: value }));
  }

  submitResult(): void {
    const form = this.formData();
    if (!form.value?.trim()) {
      this.error.set('Value is required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const orderItem = this.selectedOrderItem();
    if (orderItem?.hasResult && orderItem.existingResult) {
      // Update existing result
      this.resultEntryService.update(orderItem.existingResult.resultId, form).subscribe({
        next: (response) => {
          this.success.set(response.message);
          this.backToOrderDetail();
          this.loading.set(false);
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update result');
          this.loading.set(false);
        }
      });
    } else {
      // Create new result
      this.resultEntryService.create(form).subscribe({
        next: (response) => {
          this.success.set(response.message);
          this.backToOrderDetail();
          this.loading.set(false);
          setTimeout(() => this.success.set(null), 3000);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create result');
          this.loading.set(false);
        }
      });
    }
  }

  backToOrders(): void {
    this.selectedOrder.set(null);
    this.searchOrderItemId.set('');
    this.currentView.set('orders');
    this.loadOrders();
  }

  backToOrderDetail(): void {
    this.selectedOrderItem.set(null);
    this.currentView.set('orderDetail');
    
    const order = this.selectedOrder();
    if (order) {
      this.resultEntryService.getOrderDetail(order.orderId).subscribe({
        next: (response) => {
          this.selectedOrder.set(response.data);
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  goBack(): void {
    const view = this.currentView();
    if (view === 'resultEntry') {
      this.backToOrderDetail();
    } else if (view === 'orderDetail') {
      this.backToOrders();
    } else {
      this.router.navigate(['/lab-technologist']);
    }
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Routine';
      case 2: return 'Urgent';
      case 3: return 'STAT';
      default: return 'Unknown';
    }
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'priority-routine';
      case 2: return 'priority-urgent';
      case 3: return 'priority-stat';
      default: return '';
    }
  }

  getFlagClass(flag: string | null): string {
    if (!flag) return '';
    switch (flag.toLowerCase()) {
      case 'normal': return 'flag-normal';
      case 'abnormal': return 'flag-abnormal';
      case 'panic': return 'flag-panic';
      default: return '';
    }
  }

  getNormalRange(item: OrderItemWithTest): string {
    const min = item.minNormalValue;
    const max = item.maxNormalValue;
    if (min !== null && max !== null) {
      return `${min} - ${max}`;
    }
    return 'N/A';
  }
}
