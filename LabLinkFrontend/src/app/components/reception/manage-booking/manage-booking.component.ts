import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService, AppointmentDto } from '../../../services/appointment.service';
import { PatientService } from '../../../services/patient.service';
import {
  BookingService,
  TestItem,
  PanelItem,
  AppointmentItemDto
} from '../../../services/booking.service';
import { LabOrderService } from '../../../services/lab-order.service';
import { forkJoin } from 'rxjs';

type SelectionType = 'test' | 'panel';

interface PendingItem {
  type: SelectionType;
  id: number;
  label: string;
  priority: number;
  instructions: string;
}

@Component({
  selector: 'app-manage-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-booking.component.html',
  styleUrl: './manage-booking.component.css'
})
export class ManageBookingComponent implements OnInit {
  // Appointments list
  appointments: AppointmentDto[] = [];
  patientMap: Record<number, string> = {};
  loading = false;
  error = '';
  successMessage = '';
  filterDate = '';

  // Per-row lab order creation loading
  creatingLabOrderForId: number | null = null;

  // Booking modal (opens after lab order is created)
  showBookingModal = false;
  selectedAppointment: AppointmentDto | null = null;
  createdOrderId: number | null = null;

  // Tests & Panels data
  tests: TestItem[] = [];
  panels: PanelItem[] = [];
  dataLoading = false;
  testOptions: { value: number; label: string }[] = [];
  panelOptions: { value: number; label: string }[] = [];

  // Add form fields
  addType: SelectionType = 'test';
  addId: number | null = null;
  addPriority = 0;
  addInstructions = '';

  // Pending items (not yet saved)
  pendingItems: PendingItem[] = [];

  formError = '';
  formLoading = false;

  constructor(
    private appointmentService: AppointmentService,
    private bookingService: BookingService,
    private labOrderService: LabOrderService,
    private patientService: PatientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadTestsAndPanels();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = '';
    this.appointmentService.getAll(this.filterDate || undefined).subscribe({
      next: (res) => {
        this.appointments = res.data;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadPatientNames();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load appointments.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadPatientNames(): void {
    this.patientService.list().subscribe({
      next: (res) => {
        const map: Record<number, string> = {};
        res.data.forEach(p => { map[p.patientId] = p.name; });
        this.patientMap = map;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  getPatientName(patientId: number): string {
    return this.patientMap[patientId] ?? ('Patient #' + patientId);
  }

  loadTestsAndPanels(): void {
    this.dataLoading = true;
    this.bookingService.getTests().subscribe({
      next: (tests) => {
        this.tests = tests.filter(t => t.isActive);
        this.testOptions = this.tests.map(t => ({ value: t.testId, label: `${t.code} â€“ ${t.name}` }));
        this.dataLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.dataLoading = false; this.cdr.markForCheck(); }
    });
    this.bookingService.getPanels().subscribe({
      next: (panels) => {
        this.panels = panels.filter(p => p.isActive);
        this.panelOptions = this.panels.map(p => ({ value: p.panelId, label: `${p.panelCode} â€“ ${p.panelName}` }));
        this.cdr.markForCheck();
      },
      error: () => { this.cdr.markForCheck(); }
    });
  }

  applyFilter(): void { this.loadAppointments(); }
  clearFilter(): void { this.filterDate = ''; this.loadAppointments(); }

  // Step 1: Create lab order first, then open modal
  createLabOrderAndOpenModal(appt: AppointmentDto): void {
    this.creatingLabOrderForId = appt.appointmentId;
    this.error = '';
    this.cdr.markForCheck();

    const labOrderDto = {
      patientId: appt.patientId,
      priority: 1,
      isActive: true
    };

    this.labOrderService.createLabOrder(labOrderDto).subscribe({
      next: (res) => {
        const orderId = res.data?.orderId ?? res.data?.OrderId ?? res.data?.id;
        this.createdOrderId = orderId;
        this.selectedAppointment = appt;
        this.pendingItems = [];
        this.resetAddForm();
        this.formError = '';
        this.creatingLabOrderForId = null;
        this.showBookingModal = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.creatingLabOrderForId = null;
        this.error = err?.error?.message || 'Failed to create lab order.';
        this.cdr.markForCheck();
      }
    });
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedAppointment = null;
    this.pendingItems = [];
    this.createdOrderId = null;
    this.formError = '';
    this.cdr.markForCheck();
  }

  resetAddForm(): void {
    this.addType = 'test';
    this.addId = null;
    this.addPriority = 0;
    this.addInstructions = '';
  }

  addToPending(): void {
    if (this.addId == null) {
      this.formError = 'Please select a test or panel.';
      this.cdr.markForCheck();
      return;
    }
    this.formError = '';
    const options = this.addType === 'test' ? this.testOptions : this.panelOptions;
    const opt = options.find(o => o.value === this.addId);
    this.pendingItems.push({
      type: this.addType,
      id: this.addId,
      label: opt?.label || `#${this.addId}`,
      priority: this.addPriority,
      instructions: this.addInstructions
    });
    this.resetAddForm();
    this.cdr.markForCheck();
  }

  removePending(index: number): void {
    this.pendingItems.splice(index, 1);
    this.cdr.markForCheck();
  }

  // Step 2: Save â€” hits AppointmentItem + OrderItem APIs simultaneously
  saveAll(): void {
    if (!this.selectedAppointment || !this.createdOrderId) return;
    if (this.pendingItems.length === 0) {
      this.formError = 'Please add at least one test or panel.';
      this.cdr.markForCheck();
      return;
    }

    this.formLoading = true;
    this.formError = '';
    this.cdr.markForCheck();

    const appointmentId = this.selectedAppointment.appointmentId;
    const orderId = this.createdOrderId;

    // Build AppointmentItem calls
    const appointmentItemCalls = this.pendingItems.map(p => {
      const dto: AppointmentItemDto = {
        appointmentId,
        testId: p.type === 'test' ? p.id : null,
        panelId: p.type === 'panel' ? p.id : null,
        priority: p.priority,
        instructions: p.instructions || undefined,
        isActive: true
      };
      return this.bookingService.createAppointmentItem(dto);
    });

    // Build OrderItem calls
    const orderItemCalls = this.pendingItems.map(p => {
      const dto = {
        orderId,
        testId: p.type === 'test' ? p.id : null,
        panelId: p.type === 'panel' ? p.id : null,
        department: '',
        isActive: true
      };
      return this.labOrderService.createOrderItem(dto);
    });

    // Fire all calls simultaneously
    forkJoin([...appointmentItemCalls, ...orderItemCalls]).subscribe({
      next: () => {
        this.formLoading = false;
        this.showBookingModal = false;
        this.successMessage = `Lab Order #${orderId} created with ${this.pendingItems.length} test(s)/panel(s) booked successfully!`;
        this.pendingItems = [];
        this.createdOrderId = null;
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 5000);
      },
      error: (err) => {
        this.formLoading = false;
        this.formError = err?.error?.message || 'Failed to save items. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  formatDateTime(dt: string): string {
    if (!dt) return 'â€”';
    return new Date(dt).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/reception']);
  }
}
