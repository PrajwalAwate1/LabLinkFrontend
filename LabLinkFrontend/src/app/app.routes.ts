import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'patient',
    loadComponent: () => import('./components/patient/patient.component').then(m => m.PatientComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/manage-users',
    loadComponent: () => import('./components/admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reception',
    loadComponent: () => import('./components/reception/reception.component').then(m => m.ReceptionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reception/manage-appointments',
    loadComponent: () => import('./components/reception/manage-appointments/manage-appointments.component').then(m => m.ManageAppointmentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reception/create-appointment',
    loadComponent: () => import('./components/reception/create-appointment/create-appointment.component').then(m => m.CreateAppointmentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reception/manage-booking',
    loadComponent: () => import('./components/reception/manage-booking/manage-booking.component').then(m => m.ManageBookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reception/register-patient',
    loadComponent: () => import('./components/reception/register-patient/register-patient.component').then(m => m.RegisterPatientComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lab-technologist',
    loadComponent: () => import('./components/lab-technologist/lab-technologist.component').then(m => m.LabTechnologistComponent),
    canActivate: [authGuard]
  },
  {
    path: 'phlebotomist',
    loadComponent: () => import('./components/phlebotomist/phlebotomist.component').then(m => m.PhlebotomistComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];
