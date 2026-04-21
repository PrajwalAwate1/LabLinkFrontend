import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SpecimenService, Specimen } from '../../../services/specimen.service';

@Component({
  selector: 'app-manage-specimen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-specimen.component.html',
  styleUrl: './manage-specimen.component.css'
})
export class ManageSpecimenComponent implements OnInit {
  // Signals
  specimens = signal<Specimen[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  searchOrderId = signal<number | null>(null);

  // Computed - filtered specimens based on search
  filteredSpecimens = computed(() => {
    const search = this.searchOrderId();
    const allSpecimens = this.specimens();
    if (!search) {
      return allSpecimens;
    }
    return allSpecimens.filter(s => s.orderId === search);
  });

  constructor(
    private specimenService: SpecimenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSpecimens();
  }

  loadSpecimens(): void {
    this.loading.set(true);
    this.error.set(null);
    this.specimenService.getAll().subscribe({
      next: (response) => {
        console.log('Specimens response:', response);
        this.specimens.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading specimens:', err);
        this.error.set('Failed to load specimens');
        this.loading.set(false);
      }
    });
  }

  updateSearchOrderId(value: string): void {
    const num = value ? parseInt(value, 10) : null;
    this.searchOrderId.set(isNaN(num!) ? null : num);
  }

  searchByOrderId(): void {
    const orderId = this.searchOrderId();
    if (!orderId) {
      this.loadSpecimens();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.specimenService.getByOrderId(orderId).subscribe({
      next: (response) => {
        console.log('Search response:', response);
        this.specimens.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error searching specimens:', err);
        this.error.set('Failed to search specimens');
        this.loading.set(false);
      }
    });
  }

  clearSearch(): void {
    this.searchOrderId.set(null);
    this.loadSpecimens();
  }

  deleteSpecimen(id: number): void {
    if (confirm('Are you sure you want to delete this specimen?')) {
      this.specimenService.delete(id).subscribe({
        next: () => {
          this.specimens.update(current => current.filter(s => s.specimenId !== id));
        },
        error: (err) => {
          console.error('Error deleting specimen:', err);
          this.error.set('Failed to delete specimen');
        }
      });
    }
  }

  viewResults(orderItemId: number): void {
    this.router.navigate(['/lab-technologist/result-entry'], { queryParams: { orderItemId } });
  }

  goBack(): void {
    this.router.navigate(['/lab-technologist']);
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
