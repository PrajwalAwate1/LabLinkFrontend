import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService, RoleDto } from '../../../services/role.service';

@Component({
  selector: 'app-view-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-roles.component.html',
  styleUrl: './view-roles.component.css'
})
export class ViewRolesComponent implements OnInit {
  roles: RoleDto[] = [];
  loading = false;
  error = '';

  constructor(
    private roleService: RoleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load roles.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
