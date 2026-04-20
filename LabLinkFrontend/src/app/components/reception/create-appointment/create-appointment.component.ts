import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService, PatientResponseDto } from '../../../services/patient.service';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrl: './create-appointment.component.css'
})
export class CreateAppointmentComponent implements OnInit {
  patients: PatientResponseDto[] = [];
  filteredPatients: PatientResponseDto[] = [];
  loading = false;
  error = '';
  successMessage = '';
  searchName = '';
  searchPhone = '';

  // Selected patient for appointment
  selectedPatient: PatientResponseDto | null = null;

  // Appointment form
  showForm = false;
  formLoading = false;
  formError = '';
  form = {
    bookedDateTime: '',
    address: '',
    isActive: true
  };

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = '';
    this.patientService.list(this.searchName || undefined, this.searchPhone || undefined).subscribe({//calling the backend and load all patients or with a filter
      next: (res) => {
        this.patients = res.data;//in response we got an obj of array of patientreponse dto whic we stored in our local property
        this.filteredPatients = res.data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load patients.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applySearch(): void {//load patients with the filters
    this.loadPatients();
  }

  clearSearch(): void {
    this.searchName = '';
    this.searchPhone = '';
    this.loadPatients();
  }

  selectPatient(patient: PatientResponseDto): void {//when we select a patient for which we have to create the appointment
    this.selectedPatient = patient;
    this.showForm = true;
    this.formError = '';
    this.successMessage = '';
    this.form = {
      bookedDateTime: '',
      address: patient.address || '',
      isActive: true
    };
  }

  cancelForm(): void {
    this.showForm = false;
    this.selectedPatient = null;
    this.formError = '';
  }

  createAppointment(): void {
    if (!this.form.bookedDateTime) {
      this.formError = 'Date & Time is required.';
      return;
    }
    if (!this.form.address || !this.form.address.trim()) {//no address or just white spaces
      this.formError = 'Address is required.';
      return;
    }
    if (new Date(this.form.bookedDateTime) <= new Date()) {
      this.formError = 'Appointment date & time must be in the future.';
      return;
    }
    if (!this.selectedPatient) return;

    this.formLoading = true;
    this.formError = '';

    const payload = {//creating the resonse for db
      patientId: this.selectedPatient.patientId,
      bookedDateTime: this.form.bookedDateTime,
      address: this.form.address,
      isActive: this.form.isActive
    };

    this.appointmentService.create(payload).subscribe({//calling service and sending the payload as input
      next: () => {
        this.formLoading = false;
        this.successMessage = `Appointment created successfully for ${this.selectedPatient!.name}.`;
        this.showForm = false;
        this.selectedPatient = null;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/reception/manage-appointments']);
        }, 1500);//after 1.5 sec navigate back to the appointments page
      },
      error: (err) => {
        this.formLoading = false;
        this.formError = err?.error?.message || 'Failed to create appointment.';
        this.cdr.markForCheck();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/reception/manage-appointments']);
  }

  formatDate(dt: string | undefined): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
