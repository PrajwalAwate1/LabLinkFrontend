import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientReportService, PatientReportSummary, PatientLabReport } from '../../services/patient-report.service';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit {
  userId: string | null = null;
  
  // Report data
  reportSummary: PatientReportSummary | null = null;
  selectedReport: PatientLabReport | null = null;
  showReportsModal = false;
  showReportDetailModal = false;
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private patientReportService: PatientReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
  }

  goToTestResults(): void {
    this.router.navigate(['/patient/test-results']);
  }

  goToAppointments(): void {
    this.router.navigate(['/patient/appointments']);
  }

  goToProfile(): void {
    this.router.navigate(['/patient/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Open reports list modal
  openTestResults(): void {
    this.loading = true;
    this.error = null;
    this.showReportsModal = true;
    this.cdr.detectChanges();
    
    this.patientReportService.getMyReports().subscribe({
      next: (response) => {
        console.log('Reports received:', response.data);
        this.reportSummary = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error = err.error?.message || 'Failed to load reports';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // View specific report details
  viewReportDetail(orderId: number): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    
    this.patientReportService.getReportByOrderId(orderId).subscribe({
      next: (response) => {
        console.log('Report detail received:', response.data);
        this.selectedReport = response.data;
        this.showReportsModal = false;
        this.showReportDetailModal = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading report detail:', err);
        this.error = err.error?.message || 'Failed to load report details';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Close modals
  closeReportsModal(): void {
    this.showReportsModal = false;
    this.reportSummary = null;
  }

  closeReportDetailModal(): void {
    this.showReportDetailModal = false;
    this.selectedReport = null;
  }

  // Go back to reports list from detail view
  backToReportsList(): void {
    this.showReportDetailModal = false;
    this.selectedReport = null;
    this.openTestResults();
  }

  // Get flag class for styling
  getFlagClass(flag: string): string {
    if (!flag) return '';
    const lowerFlag = flag.toLowerCase();
    if (lowerFlag === 'normal') return 'flag-normal';
    if (lowerFlag === 'abnormal' || lowerFlag === 'high' || lowerFlag === 'low') return 'flag-abnormal';
    if (lowerFlag === 'panic' || lowerFlag === 'critical') return 'flag-critical';
    return '';
  }

  // Format date
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Download report as PDF
  downloadReport(): void {
    if (!this.selectedReport) return;

    const report = this.selectedReport;
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to download the report');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lab Report - Order #${report.orderId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #0066cc; }
          .subtitle { color: #666; margin-top: 5px; }
          .report-title { font-size: 20px; margin: 20px 0; color: #0066cc; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .info-item { }
          .info-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .info-value { font-size: 14px; font-weight: 500; margin-top: 4px; }
          .status-reviewed { color: #16a34a; }
          .status-pending { color: #ca8a04; }
          .review-notes { background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #0066cc; }
          .review-notes h4 { color: #0066cc; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: 600; color: #555; font-size: 12px; text-transform: uppercase; }
          .test-name { font-weight: 500; }
          .test-code { font-size: 11px; color: #888; }
          .result-value { font-weight: 600; }
          .flag-normal { color: #16a34a; background: #f0fdf4; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
          .flag-abnormal { color: #ca8a04; background: #fef9e8; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
          .flag-critical { color: #dc2626; background: #fef2f2; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🔬 LabLink</div>
          <div class="subtitle">Laboratory Test Report</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Order ID</div>
            <div class="info-value">#${report.orderId}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Order Date</div>
            <div class="info-value">${this.formatDate(report.orderDate)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value ${report.isReviewed ? 'status-reviewed' : 'status-pending'}">${report.status}</div>
          </div>
          ${report.reviewedBy ? `
          <div class="info-item">
            <div class="info-label">Reviewed By</div>
            <div class="info-value">${report.reviewedBy}</div>
          </div>
          ` : ''}
          ${report.reviewDate ? `
          <div class="info-item">
            <div class="info-label">Review Date</div>
            <div class="info-value">${this.formatDate(report.reviewDate)}</div>
          </div>
          ` : ''}
        </div>

        ${report.reviewNotes ? `
        <div class="review-notes">
          <h4>Pathologist Notes</h4>
          <p>${report.reviewNotes}</p>
        </div>
        ` : ''}

        <h3 class="report-title">Test Results</h3>
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Result</th>
              <th>Units</th>
              <th>Normal Range</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            ${report.testResults.map(result => `
              <tr>
                <td>
                  <div class="test-name">${result.testName || 'N/A'}</div>
                  <div class="test-code">${result.testCode || ''}</div>
                </td>
                <td class="result-value">${result.value || 'Pending'}</td>
                <td>${result.units || '-'}</td>
                <td>${result.normalRange || 'N/A'}</td>
                <td>
                  ${result.flag ? `<span class="${this.getFlagClass(result.flag)}">${result.flag}</span>` : (result.value ? '-' : 'Pending')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>This is a computer-generated report from LabLink Laboratory Management System</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
