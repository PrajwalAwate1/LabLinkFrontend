import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService, PatientUpsertDto, PatientResponseDto } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-register-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-patient.component.html',
  styleUrl: './register-patient.component.css'
})
export class RegisterPatientComponent implements OnInit {
  // Patient list
  patients: PatientResponseDto[] = [];
  loading = false;
  error = '';
  successMessage = '';

  // Search
  searchName = '';
  searchPhone = '';

  // Form modal
  showFormModal = false;
  isEditing = false;
  formLoading = false;
  formError = '';

  // Form fields
  formPatientId: number | null = null;
  formUserId: number | null = null;
  formName = '';
  formDob = '';
  formGender = '';
  formContactInfo = '';
  formAddress = '';
  formPhysicianName = '';
  // Patient user account fields (new patients only)
  formEmail = '';
  formPassword = '';

  // Delete confirm
  showDeleteConfirm = false;
  deletePatientId: number | null = null;
  deleteLoading = false;

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = '';
    this.patientService.list(
      this.searchName || undefined,
      this.searchPhone || undefined
    ).subscribe({
      next: (res) => {
        this.patients = res.data;
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

  applySearch(): void { this.loadPatients(); }
  clearSearch(): void { this.searchName = ''; this.searchPhone = ''; this.loadPatients(); }

  // ── Form Modal ──

  openCreateModal(): void {
    this.isEditing = false;
    this.resetForm();
    this.showFormModal = true;
  }

  openEditModal(p: PatientResponseDto): void {
    this.isEditing = true;
    this.formPatientId = p.patientId;
    this.formUserId = p.userId;
    this.formName = p.name;
    this.formDob = p.dob || '';
    this.formGender = p.gender || '';
    this.formContactInfo = p.contactInfo || '';
    this.formAddress = p.address || '';
    this.formPhysicianName = p.primaryPhysicianName || '';
    this.formError = '';
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formPatientId = null;
    this.formUserId = null;
    this.formName = '';
    this.formDob = '';
    this.formGender = '';
    this.formContactInfo = '';
    this.formAddress = '';
    this.formPhysicianName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formError = '';
  }

  savePatient(): void {
    if (!this.formName.trim()) {
      this.formError = 'Patient name is required.';
      return;
    }
    if (!this.formDob) {
      this.formError = 'Date of birth is required.';
      return;
    }
    if (!this.formGender) {
      this.formError = 'Gender is required.';
      return;
    }
    if (!this.formContactInfo.trim()) {
      this.formError = 'Contact info is required.';
      return;
    }
    if (!this.isEditing) {
      if (!this.formEmail.trim()) {
        this.formError = 'Email is required to create a patient account.';
        return;
      }
      if (!this.formPassword || this.formPassword.length < 8) {
        this.formError = 'Password must be at least 8 characters.';
        return;
      }
    }

    this.formLoading = true;
    this.formError = '';

    if (!this.isEditing) {
      // Step 1: Create a dedicated user account for the new patient
      this.userService.createUser({
        name: this.formName.trim(),
        email: this.formEmail.trim(),
        phone: this.formContactInfo.trim(),
        password: this.formPassword,
        roleIds: [1]  // Patient role ID
      }).subscribe({
        next: (res) => {
          const newUserId = res?.data?.UserId ?? res?.data?.userId;
          if (!newUserId) {
            this.formLoading = false;
            this.formError = 'Failed to create patient account: no user ID returned.';
            this.cdr.markForCheck();
            return;
          }
          // Step 2: Register the patient using the new user account's ID
          this.upsertPatient(newUserId);
        },
        error: (err) => {
          this.formLoading = false;
          this.formError = err?.error?.message || 'Failed to create patient user account.';
          this.cdr.markForCheck();
        }
      });
    } else {
      this.upsertPatient(this.formUserId!);
    }
  }

  private upsertPatient(userId: number): void {
    const dto: PatientUpsertDto = {
      isCreate: !this.isEditing,
      patientId: this.isEditing ? this.formPatientId : null,
      userId: userId,
      name: this.formName.trim(),
      dob: this.formDob,
      gender: this.formGender || undefined,
      contactInfo: this.formContactInfo.trim(),
      address: this.formAddress.trim() || undefined,
      isActive: true,
      primaryPhysicianName: this.formPhysicianName.trim() || undefined
    };

    this.patientService.upsert(dto).subscribe({
      next: () => {
        this.formLoading = false;
        this.successMessage = this.isEditing ? 'Patient updated successfully!' : 'Patient registered successfully!';
        this.closeFormModal();
        this.loadPatients();
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 4000);
      },
      error: (err) => {
        this.formLoading = false;
        this.formError = err?.error?.message || 'Failed to save patient.';
        this.cdr.markForCheck();
      }
    });
  }

  // ── Delete ──

  confirmDelete(id: number): void {
    this.deletePatientId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletePatientId = null;
  }

  deletePatient(): void {
    if (this.deletePatientId == null) return;
    this.deleteLoading = true;
    this.patientService.delete(this.deletePatientId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirm = false;
        this.deletePatientId = null;
        this.successMessage = 'Patient deleted successfully.';
        this.loadPatients();
        this.cdr.markForCheck();
        setTimeout(() => { this.successMessage = ''; this.cdr.markForCheck(); }, 4000);
      },
      error: (err) => {
        this.deleteLoading = false;
        this.showDeleteConfirm = false;
        this.error = err?.error?.message || 'Failed to delete patient.';
        this.cdr.markForCheck();
      }
    });
  }

  formatDate(d: string | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  goBack(): void {
    this.router.navigate(['/reception']);
  }
}
