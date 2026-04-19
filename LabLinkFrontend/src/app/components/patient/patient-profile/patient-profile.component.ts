import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PatientService, PatientResponseDto, PatientUpsertDto } from '../../../services/patient.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-profile.component.html',
  styleUrl: './patient-profile.component.css'
})
export class PatientProfileComponent implements OnInit {
  profileForm!: FormGroup;
  patientId: number | null = null;
  userId: number | null = null;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId')) || null;
    const storedPatientId = Number(localStorage.getItem('patientId')) || null;
    this.patientId = storedPatientId;

    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      contactInfo: ['', Validators.required],
      address: [''],
      primaryPhysicianName: ['']
    });

    if (this.patientId) {
      this.loadProfile(this.patientId);
    } else {
      this.isLoading = false;
    }
  }

  private readonly genderMap: Record<string, string> = {
    'Male': 'M', 'Female': 'F'
  };

  loadProfile(patientId: number): void {
    this.patientService.getPatient(patientId).subscribe({
      next: (res) => {
        const p: PatientResponseDto = res.data;
        this.profileForm.patchValue({
          name: p.name ?? '',
          dob: p.dob ? p.dob.substring(0, 10) : '',
          gender: this.genderMap[p.gender ?? ''] ?? p.gender ?? '',
          contactInfo: p.contactInfo ?? '',
          address: p.address ?? '',
          primaryPhysicianName: p.primaryPhysicianName ?? ''
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.patientId = null;
        localStorage.removeItem('patientId');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formVal = this.profileForm.value;
    const isCreate = !this.patientId;

    const dto: PatientUpsertDto = {
      isCreate,
      patientId: this.patientId ?? null,
      userId: this.userId!,
      name: formVal.name,
      dob: formVal.dob,
      gender: formVal.gender || null,
      contactInfo: formVal.contactInfo,
      address: formVal.address || null,
      isActive: true,
      primaryPhysicianName: formVal.primaryPhysicianName || null
    };

    this.patientService.upsertPatient(dto).pipe(

      switchMap((res) => {
        return [res];
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        if (res.data?.patientId) {
          this.patientId = res.data.patientId;
          localStorage.setItem('patientId', res.data.patientId.toString());
        }
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {

        if (isCreate && (err.status === 500 || err.status === 409)) {
          this.patientService.searchPatients(formVal.name, '').subscribe({
            next: (searchRes) => {

              const match = searchRes.data?.find((p) => p.userId === this.userId || (p as any).UserId === this.userId)
                ?? searchRes.data?.find(
                  (p) =>
                    p.name?.toLowerCase() === formVal.name?.toLowerCase() &&
                    p.dob?.substring(0, 10) === formVal.dob
                )
                ?? (searchRes.data?.length === 1 ? searchRes.data[0] : null);

              if (match) {
                this.patientId = match.patientId;
                localStorage.setItem('patientId', match.patientId.toString());

                this.profileForm.patchValue({
                  name: match.name ?? formVal.name,
                  dob: match.dob ? match.dob.substring(0, 10) : formVal.dob,
                  gender: this.genderMap[match.gender ?? ''] ?? match.gender ?? formVal.gender,
                  contactInfo: match.contactInfo ?? formVal.contactInfo,
                  address: match.address ?? formVal.address,
                  primaryPhysicianName: match.primaryPhysicianName ?? formVal.primaryPhysicianName
                });


                const fv = this.profileForm.value;
                const updateDto: PatientUpsertDto = {
                  isCreate: false,
                  patientId: match.patientId,
                  userId: this.userId!,
                  name: fv.name,
                  dob: fv.dob,
                  gender: fv.gender || null,
                  contactInfo: fv.contactInfo,
                  address: fv.address || null,
                  isActive: true,
                  primaryPhysicianName: fv.primaryPhysicianName || null
                };

                this.patientService.upsertPatient(updateDto).subscribe({
                  next: () => {
                    this.successMessage = 'Profile updated successfully.';
                    this.isSaving = false;
                    this.cdr.detectChanges();
                  },
                  error: () => {
                    this.errorMessage = 'Failed to save profile. Please try again.';
                    this.isSaving = false;
                    this.cdr.detectChanges();
                  }
                });
              } else {
                this.errorMessage = 'A profile for this account already exists. Please refresh the page and try again.';
                this.isSaving = false;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              this.errorMessage = 'Failed to save profile. Please try again.';
              this.isSaving = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.errorMessage = err?.error?.message ?? 'Failed to save profile. Please try again.';
          this.isSaving = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patient']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get f() {
    return this.profileForm.controls;
  }
}
