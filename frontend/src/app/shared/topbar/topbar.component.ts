import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, DemoUserOption } from '../../core/services/auth.service';
import { InventoryService } from '../../core/services/inventory.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <!-- Search Input -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Quick jump or search (Products, SKU, Orders...)" 
            class="topbar-search-input"
            (keyup.enter)="onSearch($event)"
          />
          <span class="search-kbd">⌘K</span>
        </div>
      </div>

      <!-- Actions & Persona Switcher -->
      <div class="topbar-actions">
        <!-- Low Stock Alert Pill -->
        <div *ngIf="lowStockCount > 0" class="alert-pill" (click)="goToLowStock()" title="View low stock inventory">
          <span class="alert-dot"></span>
          <span>{{ lowStockCount }} Low Stock</span>
        </div>

        <!-- Role / Persona Switcher Dropdown -->
        <div class="persona-switcher-dropdown">
          <button 
            type="button" 
            class="switcher-trigger" 
            (click)="togglePersonaMenu()"
            title="Switch demo persona for testing role-based access"
          >
            <div class="role-badge" [ngClass]="'role-' + getRoleKey()">
              {{ (currentUser?.role?.roleName || currentUser?.roleName || getRoleKey()) | uppercase }}
            </div>
            <span class="switcher-label">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
            <svg class="chevron-icon" [class.rotated]="isMenuOpen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <!-- Dropdown Menu -->
          <div *ngIf="isMenuOpen" class="persona-menu-backdrop" (click)="isMenuOpen = false"></div>
          <div *ngIf="isMenuOpen" class="persona-menu">
            <div class="persona-menu-header">
              <span class="menu-title">Switch Active Role Persona</span>
              <span class="menu-sub">Demonstrates true backend role-based access</span>
            </div>
            
            <div class="persona-options">
              <button 
                *ngFor="let key of roleKeys" 
                type="button" 
                class="persona-option"
                [class.selected]="getRoleKey() === key"
                (click)="switchRole(key)"
              >
                <div class="option-indicator" [ngClass]="'dot-' + key"></div>
                <div class="option-info">
                  <div class="option-name-row">
                    <span class="option-name">{{ demoUsers[key].name }}</span>
                    <span class="option-badge">{{ demoUsers[key].badge }}</span>
                  </div>
                  <div class="option-desc">{{ demoUsers[key].description }}</div>
                </div>
                <svg *ngIf="getRoleKey() === key" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- User Profile Avatar -->
        <div class="user-avatar-pill">
          <div class="avatar">{{ getInitials() }}</div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background-color: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2.25rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .search-container {
      flex: 1;
      max-width: 440px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.875rem;
      color: var(--text-subtle);
    }

    .topbar-search-input {
      width: 100%;
      height: 38px;
      padding: 0 3rem 0 2.5rem;
      font-size: 0.8125rem;
      font-family: inherit;
      background: var(--surface-subtle);
      border: 1px solid transparent;
      border-radius: var(--radius-full);
      color: var(--text-main);
      outline: none;
      transition: all 0.15s ease;
    }

    .topbar-search-input:focus {
      background: var(--surface);
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    .search-kbd {
      position: absolute;
      right: 0.875rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-subtle);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1px 5px;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .alert-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--danger-bg);
      color: var(--danger-text);
      border: 1px solid var(--danger-border);
      padding: 0.3125rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s ease;
    }
    .alert-pill:hover {
      transform: translateY(-1px);
    }

    .alert-dot {
      width: 6px;
      height: 6px;
      background: currentColor;
      border-radius: 50%;
      animation: alertPulse 1.5s infinite;
    }

    @keyframes alertPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Switcher Dropdown */
    .persona-switcher-dropdown {
      position: relative;
    }

    .switcher-trigger {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      padding: 0.3125rem 0.75rem 0.3125rem 0.375rem;
      transition: all 0.15s ease;
    }
    .switcher-trigger:hover {
      background: var(--surface-hover);
      border-color: var(--border-strong);
    }

    .role-badge {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.1875rem 0.5rem;
      border-radius: var(--radius-full);
      letter-spacing: 0.04em;
    }
    .role-admin { background: #eef2ff; color: #4338ca; }
    .role-manager { background: #ecfdf5; color: #047857; }
    .role-retailer { background: #fffbeb; color: #b45309; }
    .role-procurement { background: #eff6ff; color: #1d4ed8; }
    .role-customer { background: #faf5ff; color: #7e22ce; }

    .switcher-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .chevron-icon {
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }
    .chevron-icon.rotated {
      transform: rotate(180deg);
    }

    .persona-menu-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99;
    }

    .persona-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 320px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      z-index: 100;
      animation: rfScaleIn 0.15s ease-out;
      overflow: hidden;
    }

    .persona-menu-header {
      padding: 1rem 1.25rem 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--surface-subtle);
    }

    .menu-title {
      display: block;
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .menu-sub {
      display: block;
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .persona-options {
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .persona-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radius-md);
      text-align: left;
      width: 100%;
      transition: background-color 0.15s ease;
    }
    .persona-option:hover {
      background: var(--surface-subtle);
    }
    .persona-option.selected {
      background: var(--primary-light);
    }

    .option-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .dot-admin { background: #4f46e5; }
    .dot-manager { background: #10b981; }
    .dot-retailer { background: #f59e0b; }
    .dot-procurement { background: #3b82f6; }
    .dot-customer { background: #8b5cf6; }

    .option-info {
      flex: 1;
      min-width: 0;
    }

    .option-name-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .option-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .option-badge {
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .option-desc {
      font-size: 0.6875rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-avatar-pill {
      display: flex;
      align-items: center;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      color: white;
      font-size: 0.8125rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
    }
  `]
})
export class TopbarComponent implements OnInit {
  currentUser: User | null = null;
  lowStockCount = 0;
  isMenuOpen = false;

  demoUsers: Record<string, DemoUserOption>;
  roleKeys = ['admin', 'manager', 'retailer', 'procurement', 'customer'];

  constructor(
    private authService: AuthService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.demoUsers = this.authService.DEMO_USERS;
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.cdr.detectChanges();
    });

    this.loadLowStock();
  }

  loadLowStock() {
    this.inventoryService.getLowStock().subscribe({
      next: (items) => {
        this.lowStockCount = items.length;
      },
      error: () => {}
    });
  }

  togglePersonaMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  getRoleKey(): string {
    const role = this.currentUser?.role?.roleName?.toLowerCase() || 'admin';
    if (role.includes('admin')) return 'admin';
    if (role.includes('manager') || role.includes('moderator')) return 'manager';
    if (role.includes('retail') || role.includes('store')) return 'retailer';
    if (role.includes('procure') || role.includes('suppli')) return 'procurement';
    return 'customer';
  }

  switchRole(key: string) {
    this.isMenuOpen = false;
    this.authService.loginWithDemo(key as any).subscribe({
      next: (res) => {
        this.notificationService.success(
          `Switched workspace persona to ${res.user.firstName} (${res.user.role?.roleName?.toUpperCase()})`,
          'Persona Changed'
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.notificationService.error('Failed to switch persona: ' + (err.error?.message || err.message));
      }
    });
  }

  goToLowStock() {
    this.router.navigate(['/inventory'], { queryParams: { filter: 'low-stock' } });
  }

  onSearch(event: any) {
    const query = event.target.value?.trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { q: query } });
    }
  }

  getInitials(): string {
    if (!this.currentUser || !this.currentUser.firstName) return 'U';
    return (this.currentUser.firstName.charAt(0) + (this.currentUser.lastName ? this.currentUser.lastName.charAt(0) : '')).toUpperCase();
  }
}
