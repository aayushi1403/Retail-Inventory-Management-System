import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Logo Header -->
        <div class="login-header">
          <div class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <h1>RetailFlow Enterprise</h1>
          <p class="login-tagline">Retail Operations & Role-Based Inventory OS</p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="auth-tabs">
          <button 
            type="button" 
            class="auth-tab" 
            [class.active]="activeTab === 'login'" 
            (click)="activeTab = 'login'"
          >
            Sign In
          </button>
          <button 
            type="button" 
            class="auth-tab" 
            [class.active]="activeTab === 'register'" 
            (click)="activeTab = 'register'"
          >
            Create Account
          </button>
        </div>

        <!-- ============================================== -->
        <!-- TAB 1: SIGN IN FORM                            -->
        <!-- ============================================== -->
        <div *ngIf="activeTab === 'login'">
          <!-- Demo Persona Quick Selectors -->
          <div class="demo-section">
            <div class="demo-title">QUICK TEST ACCESS (1-CLICK ROLES)</div>
            <div class="persona-chips">
              <button 
                type="button" 
                class="persona-chip chip-admin"
                (click)="quickSignIn('admin')"
                title="Super Admin - alex Vance"
              >
                <span class="chip-dot"></span>
                <span class="chip-name">Admin (UID #1)</span>
              </button>
              <button 
                type="button" 
                class="persona-chip chip-manager"
                (click)="quickSignIn('manager')"
                title="Warehouse Manager - Marcus Lee"
              >
                <span class="chip-dot"></span>
                <span class="chip-name">Manager (UID #2)</span>
              </button>
              <button 
                type="button" 
                class="persona-chip chip-retailer"
                (click)="quickSignIn('retailer')"
                title="Store Retailer - Sophia Patel"
              >
                <span class="chip-dot"></span>
                <span class="chip-name">Retailer (UID #3)</span>
              </button>
              <button 
                type="button" 
                class="persona-chip chip-procure"
                (click)="quickSignIn('procurement')"
                title="Procurement Specialist - David Miller"
              >
                <span class="chip-dot"></span>
                <span class="chip-name">Procurement (UID #4)</span>
              </button>
              <button 
                type="button" 
                class="persona-chip chip-customer"
                (click)="quickSignIn('customer')"
                title="Customer - Emma Watson"
              >
                <span class="chip-dot"></span>
                <span class="chip-name">Customer (UID #5)</span>
              </button>
            </div>
          </div>

          <div class="divider">
            <span>OR SIGN IN WITH USER ID / EMAIL</span>
          </div>

          <form (ngSubmit)="onLogin()" class="auth-form">
            <div class="rf-form-group">
              <label class="rf-label">Work Email or User ID</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="loginIdentifier" 
                name="identifier" 
                placeholder="e.g. admin@retailflow.com or #1" 
                required
              />
              <span class="input-hint">Enter your numeric User ID (e.g. 1) or registered email</span>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Password</label>
              <input 
                type="password" 
                class="rf-input" 
                [(ngModel)]="loginPassword" 
                name="password" 
                placeholder="••••••••" 
                required
              />
            </div>

            <button 
              type="submit" 
              class="rf-btn rf-btn-primary w-full" 
              [disabled]="loading || !loginIdentifier || !loginPassword"
            >
              <span *ngIf="loading">Authenticating...</span>
              <span *ngIf="!loading">Sign In to Dashboard</span>
            </button>
          </form>

          <div class="switch-prompt">
            <span>Don't have an account yet? </span>
            <button type="button" class="link-btn" (click)="activeTab = 'register'">Create user profile</button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 2: REGISTER / CREATE ACCOUNT FORM          -->
        <!-- ============================================== -->
        <div *ngIf="activeTab === 'register'">
          <form (ngSubmit)="onRegister()" class="auth-form">
            <div class="grid-2">
              <div class="rf-form-group">
                <label class="rf-label">First Name *</label>
                <input 
                  type="text" 
                  class="rf-input" 
                  [(ngModel)]="regFirstName" 
                  name="firstName" 
                  placeholder="e.g. Sarah" 
                  required
                />
              </div>
              <div class="rf-form-group">
                <label class="rf-label">Last Name</label>
                <input 
                  type="text" 
                  class="rf-input" 
                  [(ngModel)]="regLastName" 
                  name="lastName" 
                  placeholder="e.g. Connor"
                />
              </div>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Email Address *</label>
              <input 
                type="email" 
                class="rf-input" 
                [(ngModel)]="regEmail" 
                name="regEmail" 
                placeholder="e.g. sarah.connor@retailflow.com" 
                required
              />
            </div>

            <div class="grid-2">
              <div class="rf-form-group">
                <label class="rf-label">Password *</label>
                <input 
                  type="password" 
                  class="rf-input" 
                  [(ngModel)]="regPassword" 
                  name="regPassword" 
                  placeholder="••••••••" 
                  required
                />
              </div>
              <div class="rf-form-group">
                <label class="rf-label">Confirm Password *</label>
                <input 
                  type="password" 
                  class="rf-input" 
                  [(ngModel)]="regConfirmPassword" 
                  name="regConfirmPassword" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            <div class="grid-2">
              <div class="rf-form-group">
                <label class="rf-label">Contact Phone</label>
                <input 
                  type="text" 
                  class="rf-input font-mono" 
                  [(ngModel)]="regPhone" 
                  name="regPhone" 
                  placeholder="+1 (555) 019-2831"
                />
              </div>
              <div class="rf-form-group">
                <label class="rf-label">Desired Business Role *</label>
                <select class="rf-select" [(ngModel)]="regRole" name="regRole" required>
                  <option value="customer">Customer (Store Orders)</option>
                  <option value="retailer">Store Retailer (POS & Sales)</option>
                  <option value="manager">Warehouse Manager (Stock & Logistics)</option>
                  <option value="procurement">Procurement Specialist (Suppliers & PO)</option>
                  <option value="admin">Super Admin (System Control)</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              class="rf-btn rf-btn-primary w-full" 
              [disabled]="loading || !regFirstName || !regEmail || !regPassword || !regConfirmPassword"
            >
              <span *ngIf="loading">Creating account...</span>
              <span *ngIf="!loading">Register & Launch Workspace</span>
            </button>
          </form>

          <div class="switch-prompt">
            <span>Already have an account? </span>
            <button type="button" class="link-btn" (click)="activeTab = 'login'">Sign in here</button>
          </div>
        </div>

        <div class="login-footer">
          <span>Connected to Spring Boot 4 REST API & MySQL 8.0</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #090d16 100%);
      padding: 2rem 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 480px;
      background: #ffffff;
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .login-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 0.75rem;
      box-shadow: 0 8px 16px rgba(99, 102, 241, 0.35);
    }

    .login-header h1 {
      font-size: 1.375rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #0f172a;
    }

    .login-tagline {
      font-size: 0.8125rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    /* Tab switcher */
    .auth-tabs {
      display: flex;
      background: #f1f5f9;
      padding: 4px;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
    }

    .auth-tab {
      flex: 1;
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: none;
      border-radius: calc(var(--radius-md) - 2px);
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: center;
    }

    .auth-tab.active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }

    .demo-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 0.875rem;
      margin-bottom: 1.25rem;
    }

    .demo-title {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .persona-chips {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .persona-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.6rem;
      border-radius: var(--radius-sm);
      border: 1px solid #e2e8f0;
      background: #ffffff;
      font-size: 0.75rem;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }

    .persona-chip:hover {
      border-color: #cbd5e1;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .chip-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .chip-admin .chip-dot { background: #4f46e5; }
    .chip-manager .chip-dot { background: #10b981; }
    .chip-retailer .chip-dot { background: #f59e0b; }
    .chip-procure .chip-dot { background: #3b82f6; }
    .chip-customer .chip-dot { background: #a855f7; }

    .divider {
      position: relative;
      text-align: center;
      margin: 1.25rem 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e2e8f0;
    }

    .divider span {
      position: relative;
      background: #ffffff;
      padding: 0 0.75rem;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    .auth-form {
      margin-bottom: 1.25rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .input-hint {
      display: block;
      font-size: 0.6875rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }

    .switch-prompt {
      text-align: center;
      font-size: 0.8125rem;
      color: #64748b;
      margin-top: 0.75rem;
    }

    .link-btn {
      background: none;
      border: none;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }

    .link-btn:hover {
      color: var(--primary-dark);
    }

    .login-footer {
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 1.25rem;
    }
  `]
})
export class LoginComponent {
  activeTab: 'login' | 'register' = 'login';

  // Login inputs
  loginIdentifier = 'admin@retailflow.com';
  loginPassword = 'admin123';

  // Registration inputs
  regFirstName = '';
  regLastName = '';
  regEmail = '';
  regPassword = '';
  regConfirmPassword = '';
  regPhone = '';
  regRole = 'retailer';

  loading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.loginIdentifier || !this.loginPassword) return;
    this.loading = true;
    this.authService.login({ email: this.loginIdentifier, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        const role = (res.user.role?.roleName || (res.user as any).roleName || 'USER').toUpperCase();
        this.notificationService.success(`Welcome back, ${res.user.firstName}! Signed in with User ID #${res.user.userId} as ${role}.`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Invalid User ID / email or password.');
      }
    });
  }

  onRegister() {
    if (!this.regFirstName || !this.regEmail || !this.regPassword) {
      this.notificationService.warning('Please fill in all required fields.');
      return;
    }

    if (this.regPassword !== this.regConfirmPassword) {
      this.notificationService.error('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    this.loading = true;
    this.authService.register({
      firstName: this.regFirstName,
      lastName: this.regLastName,
      email: this.regEmail,
      password: this.regPassword,
      phone: this.regPhone,
      roleName: this.regRole
    }).subscribe({
      next: (res) => {
        this.loading = false;
        const role = (res.user.role?.roleName || (res.user as any).roleName || this.regRole).toUpperCase();
        this.notificationService.success(
          `Account successfully created! Assigned User ID is #${res.user.userId}. Logged in as ${role}.`
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Failed to create user account.');
      }
    });
  }

  quickSignIn(roleKey: 'admin' | 'manager' | 'retailer' | 'procurement' | 'customer') {
    this.loading = true;
    this.authService.loginWithDemo(roleKey).subscribe({
      next: (res) => {
        this.loading = false;
        const role = (res.user.role?.roleName || (res.user as any).roleName || roleKey).toUpperCase();
        this.notificationService.success(`Signed in as ${res.user.firstName} (User ID #${res.user.userId}) — ${role}.`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Failed to authenticate demo user.');
      }
    });
  }
}
