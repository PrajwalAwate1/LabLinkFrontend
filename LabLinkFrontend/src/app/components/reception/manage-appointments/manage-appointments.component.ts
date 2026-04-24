import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService, AppointmentDto } from '../../../services/appointment.service';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-manage-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-appointments.component.html',
  styleUrl: './manage-appointments.component.css'
})
export class ManageAppointmentsComponent implements OnInit {
  appointments: AppointmentDto[] = [];
  patientMap: Record<number, string> = {};
  loading = false;
  error = '';
  successMessage = '';

  // Date filter
  filterDate = '';
  minDateTime = new Date().toISOString().substring(0, 16);

  // Modal
  showModal = false;
  isEditMode = false;
  editId: number | null = null;
  formLoading = false;
  formError = '';

  form: Partial<AppointmentDto> = {
    patientId: undefined,
    bookedDateTime: '',
    address: '',
    visitTypeId: undefined,
    phlebotomistId: undefined,
    isActive: true
  };

  // Delete confirm
  showDeleteConfirm = false;
  deleteId: number | null = null;
  deleteLoading = false;

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatientMap();
    this.loadAppointments();
  }

  loadPatientMap(): void {
    this.patientService.list().subscribe({
      next: (res) => {
        this.patientMap = {};
        res.data.forEach(p => { this.patientMap[p.patientId] = p.name; });
        this.cdr.markForCheck();
      },
      error: () => {} // silently ignore, names will fall back to ID
    });
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = '';

    this.appointmentService.getAll(this.filterDate || undefined).subscribe({
      next: (res) => {
        this.appointments = res.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load appointments.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter(): void {
    this.loadAppointments();
  }

  clearFilter(): void {
    this.filterDate = '';
    this.loadAppointments();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editId = null;
    this.form = {
      patientId: undefined,
      bookedDateTime: '',
      address: '',
      visitTypeId: undefined,
      phlebotomistId: undefined,
      isActive: true
    };
    this.formError = '';
    this.showModal = true;
    this.cdr.markForCheck();
  }

  openEditModal(appt: AppointmentDto): void {
    this.isEditMode = true;
    this.editId = appt.appointmentId;
    // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
    const dt = new Date(appt.bookedDateTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const localDt = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

    this.form = {
      patientId: appt.patientId,
      bookedDateTime: localDt,
      address: appt.address || '',
      visitTypeId: appt.visitTypeId ?? undefined,
      phlebotomistId: appt.phlebotomistId ?? undefined,
      isActive: appt.isActive
    };
    this.formError = '';
    this.showModal = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  saveAppointment(): void {
    if (!this.form.patientId || !this.form.bookedDateTime) {
      this.formError = 'Patient ID and Appointment Date/Time are required.';
      return;
    }

    this.formLoading = true;
    this.formError = '';

    const payload = { ...this.form };

    const obs = this.isEditMode && this.editId != null
      ? this.appointmentService.update(this.editId, payload)
      : this.appointmentService.create(payload);

    obs.subscribe({
      next: () => {
        this.formLoading = false;
        this.showModal = false;
        this.successMessage = this.isEditMode
          ? 'Appointment updated successfully.'
          : 'Appointment created successfully.';
        this.loadAppointments();
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 4000);
      },
      error: (err) => {
        this.formLoading = false;
        this.formError = err?.error?.message || 'An error occurred.';
        this.cdr.markForCheck();
      }
    });
  }

  confirmDelete(appt: AppointmentDto): void {
    this.deleteId = appt.appointmentId;
    this.showDeleteConfirm = true;
    this.cdr.markForCheck();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteId = null;
    this.cdr.markForCheck();
  }

  deleteAppointment(): void {
    if (this.deleteId == null) return;
    this.deleteLoading = true;

    this.appointmentService.delete(this.deleteId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirm = false;
        this.deleteId = null;
        this.successMessage = 'Appointment deleted successfully.';
        this.loadAppointments();
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 4000);
      },
      error: (err) => {
        this.deleteLoading = false;
        this.error = err?.error?.message || 'Failed to delete appointment.';
        this.showDeleteConfirm = false;
        this.cdr.markForCheck();
      }
    });
  }

  goToCreateAppointment(): void {
    this.router.navigate(['/reception/create-appointment']);
  }

  goBack(): void {
    this.router.navigate(['/reception']);
  }

  formatDateTime(dt: string): string {
    if (!dt) return '�';
    return new Date(dt).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
