import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reception',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reception.component.html',
  styleUrl: './reception.component.css'
})
export class ReceptionComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToManageAppointments(): void {
    this.router.navigate(['/reception/manage-appointments']);
  }

  goToManageBooking(): void {
    this.router.navigate(['/reception/manage-booking']);
  }

  goToRegisterPatient(): void {
    this.router.navigate(['/reception/register-patient']);
  }
}
