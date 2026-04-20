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
  AppointmentItemDto,
  AppointmentItemResponse
} from '../../../services/booking.service';

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

  // Booking modal
  showBookingModal = false;
  selectedAppointment: AppointmentDto | null = null;
  existingItems: AppointmentItemResponse[] = [];
  existingLoading = false;

  // Tests & Panels data
  tests: TestItem[] = [];
  panels: PanelItem[] = [];
  dataLoading = false;

  // Cached option lists
  testOptions: { value: number; label: string }[] = [];
  panelOptions: { value: number; label: string }[] = [];

  // Add form fields
  addType: SelectionType = 'test';
  addId: number | null = null;
  addPriority = 0;
  addInstructions = '';

  // Pending items (local, not yet saved)
  pendingItems: PendingItem[] = [];

  formError = '';
  formLoading = false;

  // Delete appointment item confirm
  showDeleteItemConfirm = false;
  deleteItemId: number | null = null;
  deleteItemLoading = false;

  constructor(
    private appointmentService: AppointmentService,
    private bookingService: BookingService,
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
      error: () => { /* silently ignore — IDs will still show as fallback */ }
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
        this.testOptions = this.tests.map(t => ({ value: t.testId, label: `${t.code} – ${t.name}` }));
        this.dataLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.dataLoading = false; this.cdr.markForCheck(); }
    });
    this.bookingService.getPanels().subscribe({
      next: (panels) => {
        this.panels = panels.filter(p => p.isActive);
        this.panelOptions = this.panels.map(p => ({ value: p.panelId, label: `${p.panelCode} – ${p.panelName}` }));
        this.cdr.markForCheck();
      },
      error: () => { this.cdr.markForCheck(); }
    });
  }

  applyFilter(): void { this.loadAppointments(); }
  clearFilter(): void { this.filterDate = ''; this.loadAppointments(); }

  openBookingModal(appt: AppointmentDto): void {
    this.selectedAppointment = appt;
    this.pendingItems = [];
    this.resetAddForm();
    this.formError = '';
    this.existingItems = [];
    this.showBookingModal = true;
    this.loadExistingItems(appt.appointmentId);
  }

  loadExistingItems(appointmentId: number): void {
    this.existingLoading = true;
    this.bookingService.getItemsByAppointment(appointmentId).subscribe({
      next: (res) => {
        this.existingItems = res.data;
        this.existingLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.existingLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.selectedAppointment = null;
    this.pendingItems = [];
    this.existingItems = [];
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
  }

  saveBooking(): void {
    if (!this.selectedAppointment || this.pendingItems.length === 0) return;

    this.formLoading = true;
    this.formError = '';

    const appointmentId = this.selectedAppointment.appointmentId;
    const calls = this.pendingItems.map(p => {
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

    let completed = 0;
    let hasError = false;

    calls.forEach(call => {
      call.subscribe({
        next: () => {
          completed++;
          if (completed === calls.length && !hasError) {
            this.formLoading = false;
            this.successMessage = 'Booking saved successfully!';
            this.pendingItems = [];
            this.loadExistingItems(appointmentId);
            this.cdr.markForCheck();
            setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 4000);
          }
        },
        error: (err) => {
          if (!hasError) {
            hasError = true;
            this.formLoading = false;
            this.formError = err?.error?.message || 'Failed to save booking item.';
            this.cdr.markForCheck();
          }
        }
      });
    });
  }

  confirmDeleteItem(id: number): void {
    this.deleteItemId = id;
    this.showDeleteItemConfirm = true;
  }

  cancelDeleteItem(): void {
    this.showDeleteItemConfirm = false;
    this.deleteItemId = null;
  }

  deleteItem(): void {
    if (this.deleteItemId == null) return;
    this.deleteItemLoading = true;
    this.bookingService.deleteAppointmentItem(this.deleteItemId).subscribe({
      next: () => {
        this.deleteItemLoading = false;
        this.showDeleteItemConfirm = false;
        const id = this.deleteItemId!;
        this.deleteItemId = null;
        this.existingItems = this.existingItems.filter(i => i.appItemId !== id);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.deleteItemLoading = false;
        this.formError = err?.error?.message || 'Failed to delete booking item.';
        this.showDeleteItemConfirm = false;
        this.cdr.markForCheck();
      }
    });
  }

  getTestName(testId: number | null | undefined): string {
    if (!testId) return '—';
    const t = this.tests.find(t => t.testId === testId);
    return t ? `${t.code} – ${t.name}` : `Test #${testId}`;
  }

  getPanelName(panelId: number | null | undefined): string {
    if (!panelId) return '—';
    const p = this.panels.find(p => p.panelId === panelId);
    return p ? `${p.panelCode} – ${p.panelName}` : `Panel #${panelId}`;
  }

  getItemDisplayName(item: AppointmentItemResponse): string {
    // When a standalone test is booked, backend sets PanelId = 1 (hardcoded).
    // When a panel is booked, PanelId is the actual panel and TestId is each panel test.
    // We detect standalone tests by checking if panelId is null or 1.
    if (item.testId && (item.panelId == null || item.panelId === 1)) {
      return this.getTestName(item.testId);
    }
    if (item.panelId && item.panelId !== 1) {
      return this.getPanelName(item.panelId);
    }
    return this.getTestName(item.testId);
  }

  formatDateTime(dt: string): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/reception']);
  }
}
