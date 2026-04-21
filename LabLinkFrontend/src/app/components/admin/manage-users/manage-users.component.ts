import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserDto, RoleDto, UserRegisterRequest, UserUpdateRequest } from '../../../services/user.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export class ManageUsersComponent implements OnInit {
  users: UserDto[] = [];
  roles: RoleDto[] = [];
  loading = false;
  error = '';
  successMessage = '';

  // Search
  searchName = '';
  searchPhone = '';

  // Modal
  showModal = false;
  isEditMode = false;
  editUserId: number | null = null;

  form = {
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
    roleIds: [] as number[]
  };
  formError = '';
  formLoading = false;

  // Delete confirm
  showDeleteConfirm = false;
  deleteUserId: number | null = null;
  deleteUserName = '';
  deleteLoading = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.cdr.detectChanges();
      },
      error: () => {
        this.roles = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.userService.getUsers(this.searchName || undefined, this.searchPhone || undefined).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // 404 means no users found — treat as empty list, not a hard error
        if (err.status === 404) {
          this.users = [];
        } else {
          this.error = err.error?.message || 'Failed to load users.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  search(): void {
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchName = '';
    this.searchPhone = '';
    this.loadUsers();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.editUserId = null;
    this.form = { name: '', email: '', phone: '', password: '', isActive: true, roleIds: [] };
    this.formError = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(user: UserDto): void {
    this.isEditMode = true;
    this.editUserId = user.userId;
    this.form = {
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      isActive: user.isActive,
      roleIds: [...(user.roleIds ?? [])]
    };
    this.formError = '';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  toggleRole(roleId: number): void {
    const idx = this.form.roleIds.indexOf(roleId);
    if (idx === -1) {
      this.form.roleIds.push(roleId);
    } else {
      this.form.roleIds.splice(idx, 1);
    }
    this.cdr.detectChanges();
  }

  hasRole(roleId: number): boolean {
    return this.form.roleIds.includes(roleId);
  }

  submitForm(): void {
    this.formError = '';

    if (!this.form.name.trim()) { this.formError = 'Name is required.'; this.cdr.detectChanges(); return; }
    if (!this.isEditMode && !this.form.email.trim()) { this.formError = 'Email is required.'; this.cdr.detectChanges(); return; }
    if (!this.form.phone.trim()) { this.formError = 'Phone is required.'; this.cdr.detectChanges(); return; }
    if (!this.isEditMode && !this.form.password) { this.formError = 'Password is required.'; this.cdr.detectChanges(); return; }
    if (this.form.password && (this.form.password.length < 8 || this.form.password.length > 20)) {
      this.formError = 'Password must be 8–20 characters.'; this.cdr.detectChanges(); return;
    }
    if (this.form.roleIds.length === 0) { this.formError = 'Select at least one role.'; this.cdr.detectChanges(); return; }

    this.formLoading = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.editUserId !== null) {
      const payload: UserUpdateRequest = {
        name: this.form.name,
        phone: this.form.phone,
        isActive: this.form.isActive,
        roleIds: this.form.roleIds
      };
      if (this.form.password) payload.password = this.form.password;

      this.userService.updateUser(this.editUserId, payload).subscribe({
        next: () => {
          this.formLoading = false;
          this.showModal = false;
          this.cdr.detectChanges();
          this.showSuccess('User updated successfully.');
          this.loadUsers();
        },
        error: (err) => {
          this.formError = err.error?.message || 'Failed to update user.';
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      const payload: UserRegisterRequest = {
        name: this.form.name,
        email: this.form.email,
        phone: this.form.phone,
        password: this.form.password,
        roleIds: this.form.roleIds
      };

      this.userService.createUser(payload).subscribe({
        next: () => {
          this.formLoading = false;
          this.showModal = false;
          this.cdr.detectChanges();
          this.showSuccess('User created successfully.');
          this.loadUsers();
        },
        error: (err) => {
          this.formError = err.error?.message || 'Failed to create user.';
          this.formLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  confirmDelete(user: UserDto): void {
    this.deleteUserId = user.userId;
    this.deleteUserName = user.name;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteUserId = null;
    this.deleteUserName = '';
    this.cdr.detectChanges();
  }

  executeDelete(): void {
    if (!this.deleteUserId) return;
    this.deleteLoading = true;
    this.cdr.detectChanges();

    this.userService.deleteUser(this.deleteUserId).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.showDeleteConfirm = false;
        this.deleteUserId = null;
        this.cdr.detectChanges();
        this.showSuccess('User deleted successfully.');
        this.loadUsers();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete user.';
        this.deleteLoading = false;
        this.showDeleteConfirm = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
