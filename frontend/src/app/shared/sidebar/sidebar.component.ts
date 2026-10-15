import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <!-- Brand Header -->
      <div class="sidebar-header">
        <div class="brand-badge">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="brand-info">
            <span class="brand-name">RetailFlow</span>
            <span class="brand-tag">ENTERPRISE</span>
          </div>
        </div>
      </div>

      <!-- Persona Indicator Pill -->
      <div class="sidebar-persona" *ngIf="user">
        <div class="persona-dot" [ngClass]="getRoleBadgeClass()"></div>
        <div class="persona-text">
          <div class="persona-role">{{ getRoleTitle() }}</div>
          <div class="persona-desc">{{ getRoleSubtext() }}</div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav">
        <!-- Main Section -->
        <div class="nav-section-label">WORKSPACE</div>
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>Dashboard Overview</span>
        </a>

        <!-- INVENTORY SECTION (Admin, Manager, Retailer, Procurement) -->
        <ng-container *ngIf="canAccess('inventory')">
          <div class="nav-section-label">INVENTORY & CATALOG</div>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span>Products</span>
          </a>
          <a *ngIf="isAdmin()" routerLink="/categories" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
            <span>Categories</span>
          </a>
          <a *ngIf="isAdmin() || isManager() || isRetailer()" routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
            <span>Stock Levels</span>
          </a>
        </ng-container>

        <!-- OPERATIONS SECTION (Admin, Manager) -->
        <ng-container *ngIf="isAdmin() || isManager()">
          <div class="nav-section-label">OPERATIONS & LOGISTICS</div>
          <a routerLink="/warehouses" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            <span>Warehouses</span>
          </a>
          <a routerLink="/stock-transfers" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
            <span>Stock Transfers</span>
          </a>
        </ng-container>

        <!-- PROCUREMENT (Admin, Procurement, Manager) -->
        <ng-container *ngIf="isAdmin() || isProcurement() || isManager()">
          <div class="nav-section-label">PROCUREMENT</div>
          <a *ngIf="isAdmin() || isProcurement()" routerLink="/suppliers" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Suppliers</span>
          </a>
          <a routerLink="/purchase-orders" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Purchase Orders</span>
          </a>
        </ng-container>

        <!-- SALES & CUSTOMER ORDERS (Admin, Retailer, Customer) -->
        <ng-container *ngIf="isAdmin() || isRetailer() || isCustomer()">
          <div class="nav-section-label">SALES & ORDERS</div>
          <a routerLink="/customer-orders" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            <span>Customer Orders</span>
          </a>
        </ng-container>

        <!-- ADMINISTRATION (Admin only) -->
        <ng-container *ngIf="isAdmin()">
          <div class="nav-section-label">ADMINISTRATION</div>
          <a routerLink="/users" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Users & Access</span>
          </a>
        </ng-container>
      </nav>

      <!-- User Footer -->
      <div class="sidebar-footer" *ngIf="user">
        <div class="footer-user">
          <div class="user-avatar">{{ getInitials() }}</div>
          <div class="user-details">
            <div class="user-name">{{ user.firstName }} {{ user.lastName || '' }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
        </div>
        <button (click)="logout()" class="logout-btn" title="Sign Out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background-color: var(--sidebar-bg);
      border-right: 1px solid var(--sidebar-border);
      color: var(--sidebar-text);
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
      user-select: none;
    }

    .sidebar-header {
      padding: 1.25rem 1.25rem 0.75rem;
    }

    .brand-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    .brand-info {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #ffffff;
    }

    .brand-tag {
      font-size: 0.625rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #818cf8;
    }

    .sidebar-persona {
      margin: 0.5rem 1.25rem 1rem;
      padding: 0.625rem 0.75rem;
      background: var(--sidebar-surface);
      border: 1px solid var(--sidebar-border);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .persona-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .persona-dot-admin { background-color: #6366f1; box-shadow: 0 0 8px rgba(99, 102, 241, 0.6); }
    .persona-dot-manager { background-color: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.6); }
    .persona-dot-retailer { background-color: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.6); }
    .persona-dot-procurement { background-color: #3b82f6; box-shadow: 0 0 8px rgba(59, 130, 246, 0.6); }
    .persona-dot-customer { background-color: #a855f7; box-shadow: 0 0 8px rgba(168, 85, 247, 0.6); }

    .persona-role {
      font-size: 0.75rem;
      font-weight: 700;
      color: #f1f5f9;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .persona-desc {
      font-size: 0.6875rem;
      color: var(--sidebar-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 170px;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 0.875rem;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }
    .sidebar-nav::-webkit-scrollbar-thumb {
      background: var(--sidebar-border);
      border-radius: 4px;
    }

    .nav-section-label {
      padding: 0.875rem 0.625rem 0.375rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: #64748b;
      text-transform: uppercase;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5625rem 0.75rem;
      border-radius: var(--radius-md);
      color: var(--sidebar-muted);
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 2px;
      transition: all 0.15s ease;
    }

    .nav-item:hover {
      background: var(--sidebar-hover);
      color: #ffffff;
    }

    .nav-item.active {
      background: rgba(99, 102, 241, 0.16);
      color: #818cf8;
      font-weight: 600;
    }

    .nav-icon {
      flex-shrink: 0;
      color: currentColor;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--sidebar-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(10, 15, 29, 0.5);
    }

    .footer-user {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-width: 0;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #334155;
      color: #f8fafc;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-details {
      min-width: 0;
    }

    .user-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.6875rem;
      color: var(--sidebar-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      color: var(--sidebar-muted);
      padding: 6px;
      border-radius: 6px;
      transition: all 0.15s ease;
    }

    .logout-btn:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.12);
    }
  `]
})
export class SidebarComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((u) => {
      this.user = u;
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.authService.logout();
  }

  getRole(): string {
    return this.authService.getActiveRoleName();
  }

  isAdmin(): boolean {
    return this.getRole().includes('admin');
  }

  isManager(): boolean {
    return this.getRole().includes('manager') || this.getRole().includes('moderator');
  }

  isRetailer(): boolean {
    return this.getRole().includes('retail') || this.getRole().includes('store');
  }

  isProcurement(): boolean {
    return this.getRole().includes('procure') || this.getRole().includes('suppli');
  }

  isCustomer(): boolean {
    return this.getRole().includes('customer');
  }

  canAccess(section: string): boolean {
    return true; // Detailed permissions applied per link
  }

  getRoleBadgeClass(): string {
    if (this.isAdmin()) return 'persona-dot-admin';
    if (this.isManager()) return 'persona-dot-manager';
    if (this.isRetailer()) return 'persona-dot-retailer';
    if (this.isProcurement()) return 'persona-dot-procurement';
    return 'persona-dot-customer';
  }

  getRoleTitle(): string {
    if (this.isAdmin()) return 'Super Admin';
    if (this.isManager()) return 'Warehouse Lead';
    if (this.isRetailer()) return 'Store Retailer';
    if (this.isProcurement()) return 'Procurement Lead';
    return 'Customer';
  }

  getRoleSubtext(): string {
    if (this.isAdmin()) return 'Full System Authority';
    if (this.isManager()) return 'Stock & Logistics Focus';
    if (this.isRetailer()) return 'Sales & Catalog Focus';
    if (this.isProcurement()) return 'Vendor Orders & Inbound';
    return 'Direct Consumer';
  }

  getInitials(): string {
    if (!this.user || !this.user.firstName) return 'U';
    const first = this.user.firstName.charAt(0);
    const last = this.user.lastName ? this.user.lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  }
}
