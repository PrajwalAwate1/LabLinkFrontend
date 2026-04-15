import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit {
  userId: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
