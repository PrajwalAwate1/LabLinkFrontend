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
    path: 'admin/manage-tests',
    loadComponent: () => import('./components/admin/manage-tests/manage-tests.component').then(m => m.ManageTestsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/manage-panels',
    loadComponent: () => import('./components/admin/manage-panels/manage-panels.component').then(m => m.ManagePanelsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/view-roles',
    loadComponent: () => import('./components/admin/view-roles/view-roles.component').then(m => m.ViewRolesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin/view-results',
    loadComponent: () => import('./components/admin/manage-results/manage-results.component').then(m => m.ManageResultsComponent),
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
    path: 'lab-technologist/specimen',
    loadComponent: () => import('./components/lab-technologist/manage-specimen/manage-specimen.component').then(m => m.ManageSpecimenComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lab-technologist/result-entry',
    loadComponent: () => import('./components/lab-technologist/manage-result-entry/manage-result-entry.component').then(m => m.ManageResultEntryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'phlebotomist',
    loadComponent: () => import('./components/phlebotomist/phlebotomist.component').then(m => m.PhlebotomistComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pathologist',
    loadComponent: () => import('./components/pathologist/pathologist.component').then(m => m.PathologistComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];

