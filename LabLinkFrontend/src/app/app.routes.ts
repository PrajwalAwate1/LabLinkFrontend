import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [loginGuard]
  },

  // ── Patient ──
  {
    path: 'patient',
    loadComponent: () => import('./components/patient/patient.component').then(m => m.PatientComponent),
    canActivate: [authGuard, roleGuard(['Patient'])]
  },
  {
    path: 'patient/profile',
    loadComponent: () => import('./components/patient/patient-profile/patient-profile.component').then(m => m.PatientProfileComponent),
    canActivate: [authGuard, roleGuard(['Patient'])]
  },
  {
    path: 'patient/appointments',
    loadComponent: () => import('./components/patient/patient-appointment/patient-appointment.component').then(m => m.PatientAppointmentComponent),
    canActivate: [authGuard, roleGuard(['Patient'])]
  },
  {
    path: 'patient/test-results',
    loadComponent: () => import('./components/patient/patient-test-results/patient-test-results.component').then(m => m.PatientTestResultsComponent),
    canActivate: [authGuard, roleGuard(['Patient'])]
  },

  // ── Admin ──
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, roleGuard(['Admin'])]
  },
  {
    path: 'admin/manage-users',
    loadComponent: () => import('./components/admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent),
    canActivate: [authGuard, roleGuard(['Admin'])]
  },
  {
    path: 'admin/manage-tests',
    loadComponent: () => import('./components/admin/manage-tests/manage-tests.component').then(m => m.ManageTestsComponent),
    canActivate: [authGuard, roleGuard(['Admin'])]
  },
  {
    path: 'admin/manage-panels',
    loadComponent: () => import('./components/admin/manage-panels/manage-panels.component').then(m => m.ManagePanelsComponent),
    canActivate: [authGuard, roleGuard(['Admin'])]
  },
  {
    path: 'admin/view-roles',
    loadComponent: () => import('./components/admin/view-roles/view-roles.component').then(m => m.ViewRolesComponent),
    canActivate: [authGuard, roleGuard(['Admin'])]
  },
  {
    path: 'admin/view-results',
    loadComponent: () => import('./components/admin/manage-results/manage-results.component').then(m => m.ManageResultsComponent),
    canActivate: [authGuard, roleGuard(['Admin'])]
  },

  // ── Reception ──
  {
    path: 'reception',
    loadComponent: () => import('./components/reception/reception.component').then(m => m.ReceptionComponent),
    canActivate: [authGuard, roleGuard(['Reception'])]
  },
  {
    path: 'reception/manage-appointments',
    loadComponent: () => import('./components/reception/manage-appointments/manage-appointments.component').then(m => m.ManageAppointmentsComponent),
    canActivate: [authGuard, roleGuard(['Reception'])]
  },
  {
    path: 'reception/create-appointment',
    loadComponent: () => import('./components/reception/create-appointment/create-appointment.component').then(m => m.CreateAppointmentComponent),
    canActivate: [authGuard, roleGuard(['Reception'])]
  },
  {
    path: 'reception/manage-booking',
    loadComponent: () => import('./components/reception/manage-booking/manage-booking.component').then(m => m.ManageBookingComponent),
    canActivate: [authGuard, roleGuard(['Reception'])]
  },
  {
    path: 'reception/register-patient',
    loadComponent: () => import('./components/reception/register-patient/register-patient.component').then(m => m.RegisterPatientComponent),
    canActivate: [authGuard, roleGuard(['Reception'])]
  },

  // ── Lab Technologist ──
  {
    path: 'lab-technologist',
    loadComponent: () => import('./components/lab-technologist/lab-technologist.component').then(m => m.LabTechnologistComponent),
    canActivate: [authGuard, roleGuard(['Lab Technologist'])]
  },
  {
    path: 'lab-technologist/specimen',
    loadComponent: () => import('./components/lab-technologist/manage-specimen/manage-specimen.component').then(m => m.ManageSpecimenComponent),
    canActivate: [authGuard, roleGuard(['Lab Technologist'])]
  },
  {
    path: 'lab-technologist/result-entry',
    loadComponent: () => import('./components/lab-technologist/manage-result-entry/manage-result-entry.component').then(m => m.ManageResultEntryComponent),
    canActivate: [authGuard, roleGuard(['Lab Technologist'])]
  },

  // ── Phlebotomist ──
  {
    path: 'phlebotomist',
    loadComponent: () => import('./components/phlebotomist/phlebotomist.component').then(m => m.PhlebotomistComponent),
    canActivate: [authGuard, roleGuard(['Phlebotomist'])]
  },

  // ── Pathologist ──
  {
    path: 'pathologist',
    loadComponent: () => import('./components/pathologist/pathologist.component').then(m => m.PathologistComponent),
    canActivate: [authGuard, roleGuard(['Pathologist'])]
  },

  { path: '**', redirectTo: 'login' }
];

