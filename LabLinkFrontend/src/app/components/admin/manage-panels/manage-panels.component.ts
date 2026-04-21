import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PanelService, PanelResultDto, PanelCreateRequest, PanelUpdateRequest } from '../../../services/panel.service';
import { TestService, TestDto } from '../../../services/test.service';

@Component({
  selector: 'app-manage-panels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-panels.component.html',
  styleUrl: './manage-panels.component.css'
})
export class ManagePanelsComponent implements OnInit {
  panels: PanelResultDto[] = [];
  tests: TestDto[] = [];
  loading = false;
  error = '';
  successMessage = '';

  // Search
  searchName = '';
  searchCode = '';

  // Modal
  showModal = false;
  isEditMode = false;
  editPanelId: number | null = null;

  form = {
    panelCode: '',
    panelName: '',
    testIds: [] as number[],
    isActive: true
  };
  formError = '';
  formLoading = false;

  // Deactivate confirm
  showDeactivateConfirm = false;
  deactivatePanelId: number | null = null;
  deactivatePanelName = '';
  deactivateLoading = false;

  constructor(
    private panelService: PanelService,
    private testService: TestService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTests();
    this.loadPanels();
  }

  loadTests(): void {
    this.testService.getTests().subscribe({
      next: (tests) => {
        this.tests = tests.filter(t => t.isActive);
        this.cdr.detectChanges();
      },
      error: () => {
        this.tests = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadPanels(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.panelService.getPanels(this.searchName || undefined, this.searchCode || undefined).subscribe({
      next: (panels) => {
        this.panels = panels;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 404) {
          this.panels = [];
        } else {
          this.error = err.error?.message || 'Failed to load panels.';
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
    this.loadPanels();
  }

  clearSearch(): void {
    this.searchName = '';
    this.searchCode = '';
    this.loadPanels();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editPanelId = null;
    this.form = { panelCode: '', panelName: '', testIds: [], isActive: true };
    this.formError = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(panel: PanelResultDto): void {
    this.isEditMode = true;
    this.editPanelId = panel.panelId;
    this.form = {
      panelCode: panel.panelCode,
      panelName: panel.panelName,
      testIds: [...(panel.testIds ?? [])],
      isActive: panel.isActive
    };
    this.formError = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  toggleTest(testId: number): void {
    const idx = this.form.testIds.indexOf(testId);
    if (idx === -1) {
      this.form.testIds.push(testId);
    } else {
      this.form.testIds.splice(idx, 1);
    }
    this.cdr.detectChanges();
  }

  hasTest(testId: number): boolean {
    return this.form.testIds.includes(testId);
  }

  submitForm(): void {
    this.formError = '';

    if (!this.form.panelCode.trim()) { this.formError = 'Panel code is required.'; this.cdr.detectChanges(); return; }
    if (this.form.panelCode.trim().length > 50) { this.formError = 'Panel code cannot exceed 50 characters.'; this.cdr.detectChanges(); return; }
    if (!this.form.panelName.trim()) { this.formError = 'Panel name is required.'; this.cdr.detectChanges(); return; }
    if (this.form.panelName.trim().length > 255) { this.formError = 'Panel name cannot exceed 255 characters.'; this.cdr.detectChanges(); return; }
    if (this.form.testIds.length === 0) { this.formError = 'Select at least one test.'; this.cdr.detectChanges(); return; }

    this.formLoading = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.editPanelId !== null) {
      const payload: PanelUpdateRequest = {
        id: this.editPanelId,
        panelCode: this.form.panelCode,
        panelName: this.form.panelName,
        testIds: this.form.testIds,
        isActive: this.form.isActive
      };

      this.panelService.updatePanel(payload).subscribe({
        next: () => {
          this.formLoading = false;
          this.showModal = false;
          this.cdr.detectChanges();
          this.showSuccess('Panel updated successfully.');
          this.loadPanels();
        },
        error: (err) => {
          this.formError = err.error?.error || err.error?.message || 'Failed to update panel.';
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const payload: PanelCreateRequest = {
        panelCode: this.form.panelCode,
        panelName: this.form.panelName,
        testIds: this.form.testIds
      };

      this.panelService.createPanel(payload).subscribe({
        next: () => {
          this.formLoading = false;
          this.showModal = false;
          this.cdr.detectChanges();
          this.showSuccess('Panel created successfully.');
          this.loadPanels();
        },
        error: (err) => {
          this.formError = err.error?.error || err.error?.message || 'Failed to create panel.';
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  confirmDeactivate(panel: PanelResultDto): void {
    this.deactivatePanelId = panel.panelId;
    this.deactivatePanelName = panel.panelName;
    this.showDeactivateConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDeactivate(): void {
    this.showDeactivateConfirm = false;
    this.deactivatePanelId = null;
    this.deactivatePanelName = '';
    this.cdr.detectChanges();
  }

  executeDeactivate(): void {
    if (!this.deactivatePanelId) return;
    this.deactivateLoading = true;
    this.cdr.detectChanges();

    this.panelService.deactivatePanel(this.deactivatePanelId).subscribe({
      next: () => {
        this.deactivateLoading = false;
        this.showDeactivateConfirm = false;
        this.deactivatePanelId = null;
        this.cdr.detectChanges();
        this.showSuccess('Panel deactivated successfully.');
        this.loadPanels();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to deactivate panel.';
        this.deactivateLoading = false;
        this.showDeactivateConfirm = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
