import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService, AppointmentResponse } from '../../../services/appointment.service';
import { AuthService } from '../../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-patient-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './patient-appointment.component.html',
  styleUrl: './patient-appointment.component.css'
})
export class PatientAppointmentComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  filteredAppointments: AppointmentResponse[] = [];
  isLoading = true;
  isSaving = false;
  isDeleting = false;

  filterDate = '';
  successMessage = '';
  errorMessage = '';

  appointmentForm!: FormGroup;
  editingId: number | null = null;
  deletingId: number | null = null;

  patientId: number | null = null;

  private modalInstance: any = null;
  private deleteModalInstance: any = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.patientId = Number(localStorage.getItem('patientId')) || null;
    this.buildForm();
    this.loadAppointments();
  }

  private buildForm(): void {
    this.appointmentForm = this.fb.group({
      bookedDateTime: ['', Validators.required],
      address: ['', Validators.required]
    });
  }



  loadAppointments(date?: string): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.appointmentService.getByDate(date).subscribe({
      next: (res) => {

        const pid = this.patientId;
        this.appointments = (res.data ?? []).filter(a => a.patientId === pid);
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load appointments.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDateFilter(): void {
    this.loadAppointments(this.filterDate || undefined);
  }

  clearFilter(): void {
    this.filterDate = '';
    this.loadAppointments();
  }

  private applyFilter(): void {
    this.filteredAppointments = [...this.appointments];
  }

  openBookModal(): void {
    this.editingId = null;
    this.appointmentForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal('appointmentModal');
  }

  openEditModal(appt: AppointmentResponse): void {
    this.editingId = appt.appointmentId;
    this.appointmentForm.patchValue({
      bookedDateTime: appt.bookedDateTime ? appt.bookedDateTime.substring(0, 16) : '',
      address: appt.address ?? ''
    });
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal('appointmentModal');
  }

  onSave(): void {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const val = this.appointmentForm.value;
    const bookedDateTime = val.bookedDateTime;


    const hasConflict = this.appointments.some(appt => {

      if (this.editingId && appt.appointmentId === this.editingId) {
        return false;
      }

      return appt.patientId === this.patientId &&
        appt.bookedDateTime &&
        new Date(appt.bookedDateTime).getTime() === new Date(bookedDateTime).getTime() &&
        appt.isActive;
    });

    if (hasConflict) {
      this.errorMessage = 'An appointment is already booked for this date and time. Please choose a different time.';
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();

    const dto = {
      patientId: this.patientId!,
      bookedDateTime: val.bookedDateTime,
      address: val.address || null,
      isActive: true
    };

    const call = this.editingId
      ? this.appointmentService.update(this.editingId, { ...dto, appointmentId: this.editingId })
      : this.appointmentService.create(dto);

    call.subscribe({
      next: (res) => {
        this.isSaving = false;
        this.hideModal('appointmentModal');
        this.successMessage = res.message;
        this.loadAppointments(this.filterDate || undefined);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message ?? 'Failed to save appointment.';
        this.cdr.detectChanges();
      }
    });
  }



  openDeleteModal(id: number): void {
    this.deletingId = id;
    this.showModal('deleteModal');
  }

  confirmDelete(): void {
    if (!this.deletingId) return;
    this.isDeleting = true;
    this.cdr.detectChanges();

    this.appointmentService.delete(this.deletingId).subscribe({
      next: (res) => {
        this.isDeleting = false;
        this.hideModal('deleteModal');
        this.successMessage = res.message;
        this.loadAppointments(this.filterDate || undefined);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDeleting = false;
        this.errorMessage = 'Failed to cancel appointment.';
        this.hideModal('deleteModal');
        this.cdr.detectChanges();
      }
    });
  }


  private showModal(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      this.modalInstance = new bootstrap.Modal(el);
      this.modalInstance.show();
    }
  }

  private hideModal(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      const m = bootstrap.Modal.getInstance(el);
      m?.hide();
    }
  }

  formatDateTime(dt: string): string {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
  }

  isUpcoming(dt: string): boolean {
    return new Date(dt) >= new Date();
  }

  goBack(): void { this.router.navigate(['/patient']); }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get f() { return this.appointmentForm.controls; }
}
