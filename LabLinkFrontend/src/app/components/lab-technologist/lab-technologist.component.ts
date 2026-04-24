import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lab-technologist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lab-technologist.component.html',
  styleUrl: './lab-technologist.component.css'
})
export class LabTechnologistComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToSpecimen(): void {
    this.router.navigate(['/lab-technologist/specimen']);
  }

  navigateToResultEntry(): void {
    this.router.navigate(['/lab-technologist/result-entry']);
  }
}
