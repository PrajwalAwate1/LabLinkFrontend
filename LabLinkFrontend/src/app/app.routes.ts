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
    path: 'patient/profile',
    loadComponent: () => import('./components/patient/patient-profile/patient-profile.component').then(m => m.PatientProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'patient/appointments',
    loadComponent: () => import('./components/patient/patient-appointment/patient-appointment.component').then(m => m.PatientAppointmentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'patient/test-results',
    loadComponent: () => import('./components/patient/patient-test-results/patient-test-results.component').then(m => m.PatientTestResultsComponent),
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
