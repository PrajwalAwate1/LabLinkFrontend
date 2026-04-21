import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestService, TestDto, TestCreateRequest } from '../../../services/test.service';
import { LookupService, LookupItem } from '../../../services/lookup.service';

@Component({
  selector: 'app-manage-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-tests.component.html',
  styleUrl: './manage-tests.component.css'
})
export class ManageTestsComponent implements OnInit {
  tests: TestDto[] = [];
  loading = false;
  error = '';
  successMessage = '';

  containerTypes: LookupItem[] = [];
  departments: LookupItem[] = [];
  specimenTypes: LookupItem[] = [];

  // Search
  searchName = '';
  searchCode = '';

  // Modal
  showModal = false;
  isEditMode = false;
  editTestId: number | null = null;

  form: TestCreateRequest = {
    code: '',
    name: '',
    departmentId: null,
    specimenTypeId: null,
    containerTypeId: 0,
    volumeReq: null,
    units: null,
    maxNormalValue: 0,
    minNormalValue: 0,
    tatTargetMinutes: null,
    refRangeJson: null,
    isActive: true
  };
  formError = '';
  formLoading = false;

  // Deactivate confirm
  showDeactivateConfirm = false;
  deactivateTestId: number | null = null;
  deactivateTestName = '';
  deactivateLoading = false;

  constructor(
    private testService: TestService,
    private lookupService: LookupService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTests();
    this.loadLookups();
  }

  loadLookups(): void {
    this.lookupService.getContainerTypes().subscribe({ next: (data) => { this.containerTypes = data; this.cdr.detectChanges(); } });
    this.lookupService.getDepartments().subscribe({ next: (data) => { this.departments = data; this.cdr.detectChanges(); } });
    this.lookupService.getSpecimenTypes().subscribe({ next: (data) => { this.specimenTypes = data; this.cdr.detectChanges(); } });
  }

  loadTests(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.testService.getTests(this.searchName || undefined, this.searchCode || undefined).subscribe({
      next: (tests) => {
        this.tests = tests;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.tests = [];
        } else if (err.status === 401) {
          this.error = 'Session expired. Please log in again.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Your account does not have permission to view tests.';
        } else {
          this.error = err.error?.message || err.error || `Error ${err.status}: Failed to load tests.`;
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  search(): void {
    this.loadTests();
  }

  clearSearch(): void {
    this.searchName = '';
    this.searchCode = '';
    this.loadTests();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editTestId = null;
    this.form = {
      code: '',
      name: '',
      departmentId: null,
      specimenTypeId: null,
      containerTypeId: 0,
      volumeReq: null,
      units: null,
      maxNormalValue: 0,
      minNormalValue: 0,
      tatTargetMinutes: null,
      refRangeJson: null,
      isActive: true
    };
    this.formError = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(test: TestDto): void {
    this.isEditMode = true;
    this.editTestId = test.testId;
    this.form = {
      code: test.code,
      name: test.name,
      departmentId: test.departmentId,
      specimenTypeId: test.specimenTypeId,
      containerTypeId: test.containerTypeId,
      volumeReq: test.volumeReq,
      units: test.units,
      maxNormalValue: test.maxNormalValue,
      minNormalValue: test.minNormalValue,
      tatTargetMinutes: test.tatTargetMinutes,
      refRangeJson: test.refRangeJson,
      isActive: test.isActive
    };
    this.formError = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  submitForm(): void {
    this.formError = '';

    if (!this.form.code.trim()) { this.formError = 'Test code is required.'; this.cdr.detectChanges(); return; }
    if (!this.form.name.trim()) { this.formError = 'Test name is required.'; this.cdr.detectChanges(); return; }
    if (!this.form.containerTypeId || this.form.containerTypeId <= 0) { this.formError = 'Container Type ID is required.'; this.cdr.detectChanges(); return; }
    if (this.form.minNormalValue > this.form.maxNormalValue) { this.formError = 'Min normal value cannot exceed max normal value.'; this.cdr.detectChanges(); return; }

    this.formLoading = true;
    this.cdr.detectChanges();

    const payload: TestCreateRequest = { ...this.form };

    if (this.isEditMode && this.editTestId !== null) {
      this.testService.updateTest(this.editTestId, payload).subscribe({
        next: () => {
          this.formLoading = false;
          this.showModal = false;
          this.cdr.detectChanges();
          this.showSuccess('Test updated successfully.');
          this.loadTests();
        },
        error: (err) => {
          this.formError = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to update test.');
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.testService.createTest(payload).subscribe({
        next: () => {
          this.formLoading = false;
          this.showModal = false;
          this.cdr.detectChanges();
          this.showSuccess('Test created successfully.');
          this.loadTests();
        },
        error: (err) => {
          this.formError = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to create test.');
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  confirmDeactivate(test: TestDto): void {
    this.deactivateTestId = test.testId;
    this.deactivateTestName = test.name;
    this.showDeactivateConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDeactivate(): void {
    this.showDeactivateConfirm = false;
    this.deactivateTestId = null;
    this.deactivateTestName = '';
    this.cdr.detectChanges();
  }

  executeDeactivate(): void {
    if (!this.deactivateTestId) return;
    this.deactivateLoading = true;
    this.cdr.detectChanges();

    this.testService.deactivateTest(this.deactivateTestId).subscribe({
      next: () => {
        this.deactivateLoading = false;
        this.showDeactivateConfirm = false;
        this.deactivateTestId = null;
        this.cdr.detectChanges();
        this.showSuccess('Test deactivated successfully.');
        this.loadTests();
      },
      error: (err) => {
        this.error = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to deactivate test.');
        this.deactivateLoading = false;
        this.showDeactivateConfirm = false;
        this.cdr.detectChanges();
      }
    });
  }

  getContainerTypeName(id: number): string {
    return this.containerTypes.find(c => c.id === id)?.name ?? String(id);
  }

  getDepartmentName(id: number | null): string {
    if (!id) return '—';
    return this.departments.find(d => d.id === id)?.name ?? String(id);
  }

  getSpecimenTypeName(id: number | null): string {
    if (!id) return '—';
    return this.specimenTypes.find(s => s.id === id)?.name ?? String(id);
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
