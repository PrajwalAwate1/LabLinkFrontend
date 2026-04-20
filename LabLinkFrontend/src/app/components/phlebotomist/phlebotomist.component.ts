import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PhlebotomistService, LabOrderResponse, OrderItemResponse, SpecimenResponse, SpecimenCreateDto, PatientInfo, TestInfo } from '../../services/phlebotomist.service';
import { forkJoin } from 'rxjs';

interface OrderItemWithSpecimen extends OrderItemResponse {
  specimens: SpecimenResponse[];
  isCollected: boolean;
  rejectionReason: string;
  testName?: string;
}

interface OrderWithItems extends LabOrderResponse {
  items: OrderItemWithSpecimen[];
  showItems: boolean;
  patientName?: string;
}

@Component({
  selector: 'app-phlebotomist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phlebotomist.component.html',
  styleUrl: './phlebotomist.component.css'
})
export class PhlebotomistComponent implements OnInit {
  orders: OrderWithItems[] = [];
  loading = false;
  errorMessage = '';
  selectedDate: string = '';
  userId: number = 0;
  userName: string = '';
  patientCache: Map<number, string> = new Map();
  testCache: Map<number, string> = new Map();

  constructor(
    private authService: AuthService,
    private router: Router,
    private phlebotomistService: PhlebotomistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      this.userId = parseInt(userIdStr, 10);
    }
    
    const email = localStorage.getItem('userEmail') || '';
    this.userName = email.split('@')[0] || 'Unknown User';
    
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.phlebotomistService.getLabOrders(this.selectedDate).subscribe({
      next: (orders) => {
        this.orders = orders.map(order => ({
          ...order,
          items: [],
          showItems: false,
          patientName: undefined
        }));
        
        const patientIds = [...new Set(orders.map(o => o.patientId))];
        const patientRequests = patientIds
          .filter(id => !this.patientCache.has(id))
          .map(id => this.phlebotomistService.getPatientById(id));
        
        if (patientRequests.length > 0) {
          forkJoin(patientRequests).subscribe({
            next: (patients) => {
              patients.forEach(p => this.patientCache.set(p.patientId, p.name));
              this.orders.forEach(order => {
                order.patientName = this.patientCache.get(order.patientId);
              });
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error loading patient names:', err);
              this.cdr.detectChanges();
            }
          });
        } else {
          this.orders.forEach(order => {
            order.patientName = this.patientCache.get(order.patientId);
          });
        }
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load lab orders';
        console.error('Error loading orders:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleOrderItems(order: OrderWithItems): void {
    order.showItems = !order.showItems;
    
    if (order.showItems && order.items.length === 0) {

      this.phlebotomistService.getOrderItems(order.orderId).subscribe({
        next: (items) => {
          const specimenRequests = items.map(item =>
            this.phlebotomistService.getSpecimensByOrderItemId(item.orderItemId)
          );
          
          forkJoin(specimenRequests).subscribe({
            next: (specimensArrays) => {
              order.items = items.map((item, index) => ({
                ...item,
                specimens: specimensArrays[index],
                isCollected: specimensArrays[index].length > 0 && !specimensArrays[index][0].rejectionReason,
                rejectionReason: specimensArrays[index].length > 0 ? (specimensArrays[index][0].rejectionReason || '') : '',
                testName: undefined
              }));
              
              const testIds = items.filter(i => i.testId).map(i => i.testId!);
              const uniqueTestIds = [...new Set(testIds)];
              const testRequests = uniqueTestIds
                .filter(id => !this.testCache.has(id))
                .map(id => this.phlebotomistService.getTestById(id));
              
              if (testRequests.length > 0) {
                forkJoin(testRequests).subscribe({
                  next: (tests) => {
                    tests.forEach(t => this.testCache.set(t.testId, t.testName));
                    order.items.forEach(item => {
                      if (item.testId) {
                        item.testName = this.testCache.get(item.testId);
                      }
                    });
                    this.cdr.detectChanges();
                  },
                  error: (err) => {
                    console.error('Error loading test names:', err);
                    this.cdr.detectChanges();
                  }
                });
              } else {
                order.items.forEach(item => {
                  if (item.testId) {
                    item.testName = this.testCache.get(item.testId);
                  }
                });
              }
              
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error loading specimens:', error);
              order.items = items.map(item => ({
                ...item,
                specimens: [],
                isCollected: false,
                rejectionReason: '',
                testName: undefined
              }));
              this.cdr.detectChanges();
            }
          });
        },
        error: (error) => {
          this.errorMessage = 'Failed to load order items';
          console.error('Error loading order items:', error);
          this.cdr.detectChanges();
        }
      });
    }
    
    this.cdr.detectChanges();
  }

  onCollectionStatusChange(order: OrderWithItems, item: OrderItemWithSpecimen): void {
    if (!item.isCollected && !item.rejectionReason.trim()) {
      alert('Please provide a reason for not collecting the specimen');
      item.isCollected = true;
      this.cdr.detectChanges();
      return;
    }
    
    if (item.isCollected) {
      item.rejectionReason = '';
    }
    
    this.cdr.detectChanges();
  }

  saveSpecimenStatus(order: OrderWithItems, item: OrderItemWithSpecimen): void {
    if (!item.isCollected && !item.rejectionReason.trim()) {
      alert('Please provide a reason for not collecting the specimen');
      return;
    }

    const dto: SpecimenCreateDto = {
      orderID: order.orderId,
      orderItemId: item.orderItemId,
      specimenTypeId: 1,
      containerTypeId: 1,
      collectedBy: this.userId,
      collectedDate: item.isCollected ? new Date().toISOString() : undefined,
      rejectionReason: item.isCollected ? undefined : item.rejectionReason,
      isActive: true
    };

    this.phlebotomistService.createSpecimen(dto).subscribe({
      next: (specimen) => {
        item.specimens.push(specimen);
        alert('Specimen status saved successfully');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error saving specimen:', error);
        alert('Failed to save specimen status. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  onDateChange(): void {
    this.loadOrders();
  }

  getUserName(userId: number | undefined): string {
    if (!userId) return 'Unknown';
    if (userId === this.userId) {
      const nameParts = this.userName.split('.');
      const formattedName = nameParts
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
      return formattedName;
    }
    return `User ID: ${userId}`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
