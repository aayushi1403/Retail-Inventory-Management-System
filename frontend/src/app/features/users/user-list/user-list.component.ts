import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User, Role } from '../../../core/models/models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>User Access & Permissions</h1>
          <p class="page-subtitle">Manage organization accounts, role assignments, and authorization security</p>
        </div>

        <button (click)="openAddUserModal()" class="rf-btn rf-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Provision New User</span>
        </button>
      </div>

      <!-- Users Table -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>User Name & Details</th>
              <th>Email Address</th>
              <th>Role Assignment</th>
              <th>Phone</th>
              <th>Account Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>
                <div class="flex items-center gap-3">
                  <div class="user-table-avatar">{{ getInitials(u) }}</div>
                  <div>
                    <div class="font-bold text-main">{{ u.firstName }} {{ u.lastName || '' }}</div>
                    <div class="text-muted font-mono" style="font-size: 0.6875rem;">UID: #{{ u.userId }}</div>
                  </div>
                </div>
              </td>
              <td class="font-mono text-main">{{ u.email }}</td>
              <td>
                <span class="role-pill" [ngClass]="'pill-' + getRoleClass(u.role?.roleName)">
                  {{ u.role?.roleName || 'Unassigned' }}
                </span>
              </td>
              <td class="font-mono text-muted">{{ u.phone || '—' }}</td>
              <td>
                <span class="rf-badge" [ngClass]="u.status === 'ACTIVE' ? 'rf-badge-success' : 'rf-badge-danger'">
                  {{ u.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <button (click)="openEditRoleModal(u)" class="rf-btn rf-btn-secondary rf-btn-sm">
                    Assign Role
                  </button>
                  <button (click)="toggleUserStatus(u)" class="rf-btn rf-btn-ghost rf-btn-sm" [class.text-danger]="u.status === 'ACTIVE'">
                    {{ u.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>

      <!-- Edit Role Modal -->
      <div class="rf-modal-backdrop" *ngIf="selectedUserForRole">
        <div class="rf-modal" style="max-width: 460px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">Assign Role to {{ selectedUserForRole.firstName }}</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="selectedUserForRole = null">✕</button>
          </div>
          <form (ngSubmit)="saveUserRole()" class="rf-modal-body">
            <div class="rf-form-group">
              <label class="rf-label">Select Business Role *</label>
              <select class="rf-select" [(ngModel)]="newRoleId" name="role" required>
                <option *ngFor="let r of roles" [value]="r.roleId">
                  {{ r.roleName | uppercase }} — {{ r.description }}
                </option>
              </select>
            </div>
            <div class="rf-modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
              <button type="button" class="rf-btn rf-btn-secondary" (click)="selectedUserForRole = null">Cancel</button>
              <button type="submit" class="rf-btn rf-btn-primary" [disabled]="saving">
                <span *ngIf="saving">Updating Role...</span>
                <span *ngIf="!saving">Apply Role</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Provision User Modal -->
      <div class="rf-modal-backdrop" *ngIf="showAddUserModal">
        <div class="rf-modal" style="max-width: 520px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">Provision New Organization Account</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="showAddUserModal = false">✕</button>
          </div>
          <form (ngSubmit)="createUser()" class="rf-modal-body">
            <div class="grid-2">
              <div class="rf-form-group">
                <label class="rf-label">First Name *</label>
                <input type="text" class="rf-input" [(ngModel)]="newUser.firstName" name="fn" required />
              </div>
              <div class="rf-form-group">
                <label class="rf-label">Last Name</label>
                <input type="text" class="rf-input" [(ngModel)]="newUser.lastName" name="ln" />
              </div>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Corporate Email *</label>
              <input type="email" class="rf-input" [(ngModel)]="newUser.email" name="em" required />
            </div>

            <div class="grid-2">
              <div class="rf-form-group">
                <label class="rf-label">Initial Password *</label>
                <input type="password" class="rf-input" [(ngModel)]="newUserPassword" name="pw" required />
              </div>
              <div class="rf-form-group">
                <label class="rf-label">Phone</label>
                <input type="text" class="rf-input font-mono" [(ngModel)]="newUser.phone" name="ph" />
              </div>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Assign Role *</label>
              <select class="rf-select" [(ngModel)]="newProvisionRoleId" name="rrole" required>
                <option value="">Select a role</option>
                <option *ngFor="let r of roles" [value]="r.roleId">
                  {{ r.roleName | uppercase }} — {{ r.description }}
                </option>
              </select>
            </div>

            <div class="rf-modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
              <button type="button" class="rf-btn rf-btn-secondary" (click)="showAddUserModal = false">Cancel</button>
              <button type="submit" class="rf-btn rf-btn-primary" [disabled]="saving || !newUser.firstName || !newUser.email || !newUserPassword || !newProvisionRoleId">
                <span *ngIf="saving">Provisioning...</span>
                <span *ngIf="!saving">Create Account</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-table-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e0e7ff;
      color: #4338ca;
      font-weight: 700;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .role-pill {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      display: inline-block;
    }

    .pill-admin { background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; }
    .pill-manager { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .pill-retailer { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .pill-procurement { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .pill-customer { background: #faf5ff; color: #7e22ce; border: 1px solid #e9d5ff; }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  loading = true;

  selectedUserForRole: User | null = null;
  newRoleId: any = '';

  showAddUserModal = false;
  newUser: Partial<User> = { firstName: '', lastName: '', email: '', phone: '', status: 'ACTIVE' };
  newUserPassword = '';
  newProvisionRoleId: any = '';
  saving = false;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      users: this.userService.getAll(),
      roles: this.roleService.getAll()
    }).subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.roles = res.roles || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load user roster');
      }
    });
  }

  getRoleClass(roleName?: string): string {
    if (!roleName) return 'customer';
    const r = roleName.toLowerCase();
    if (r.includes('admin')) return 'admin';
    if (r.includes('manager') || r.includes('moderator')) return 'manager';
    if (r.includes('retail') || r.includes('store')) return 'retailer';
    if (r.includes('procure') || r.includes('suppli')) return 'procurement';
    return 'customer';
  }

  getInitials(u: User): string {
    const f = u.firstName ? u.firstName.charAt(0) : 'U';
    const l = u.lastName ? u.lastName.charAt(0) : '';
    return (f + l).toUpperCase();
  }

  openEditRoleModal(user: User) {
    this.selectedUserForRole = user;
    this.newRoleId = user.role?.roleId || (this.roles[0]?.roleId || '');
  }

  saveUserRole() {
    if (!this.selectedUserForRole?.userId || !this.newRoleId) return;
    this.saving = true;

    const role = this.roles.find(r => r.roleId === Number(this.newRoleId));
    if (!role) {
      this.saving = false;
      return;
    }

    const payload: User = {
      ...this.selectedUserForRole,
      role
    };

    this.userService.update(this.selectedUserForRole.userId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.success(`Assigned role ${role.roleName.toUpperCase()} to ${this.selectedUserForRole?.firstName}.`);
        this.selectedUserForRole = null;
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.error(err.error?.message || 'Failed to update user role');
      }
    });
  }

  toggleUserStatus(user: User) {
    if (!user.userId) return;
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const payload: User = { ...user, status: newStatus };

    this.userService.update(user.userId, payload).subscribe({
      next: () => {
        this.notificationService.success(`User ${user.firstName} status set to ${newStatus}.`);
        this.loadData();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to update user status');
      }
    });
  }

  openAddUserModal() {
    this.newUser = { firstName: '', lastName: '', email: '', phone: '', status: 'ACTIVE' };
    this.newUserPassword = '';
    this.newProvisionRoleId = this.roles[0]?.roleId || '';
    this.showAddUserModal = true;
  }

  createUser() {
    if (!this.newUser.firstName || !this.newUser.email || !this.newUserPassword || !this.newProvisionRoleId) return;
    this.saving = true;

    const role = this.roles.find(r => r.roleId === Number(this.newProvisionRoleId));
    if (!role) {
      this.saving = false;
      return;
    }

    const payload: any = {
      ...this.newUser,
      password: this.newUserPassword,
      role
    };

    this.userService.create(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showAddUserModal = false;
        this.notificationService.success(`User account for ${payload.firstName} created successfully.`);
        this.loadData();
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.error(err.error?.message || 'Failed to provision user');
      }
    });
  }
}
