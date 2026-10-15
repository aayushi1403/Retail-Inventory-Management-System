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
          <p class="login-tagline">Retail Operations & Multi-Warehouse Inventory OS</p>
        </div>

        <!-- Demo Persona Quick Selectors -->
        <div class="demo-section">
          <div class="demo-title">TEST PERSONAS (1-CLICK SIGN IN)</div>
          <div class="persona-chips">
            <button 
              type="button" 
              class="persona-chip chip-admin"
              (click)="quickSignIn('admin')"
            >
              <span class="chip-dot"></span>
              <span class="chip-name">Admin (Alex)</span>
            </button>
            <button 
              type="button" 
              class="persona-chip chip-manager"
              (click)="quickSignIn('manager')"
            >
              <span class="chip-dot"></span>
              <span class="chip-name">Manager (Marcus)</span>
            </button>
            <button 
              type="button" 
              class="persona-chip chip-retailer"
              (click)="quickSignIn('retailer')"
            >
              <span class="chip-dot"></span>
              <span class="chip-name">Retailer (Sophia)</span>
            </button>
            <button 
              type="button" 
              class="persona-chip chip-procure"
              (click)="quickSignIn('procurement')"
            >
              <span class="chip-dot"></span>
              <span class="chip-name">Procurement (David)</span>
            </button>
            <button 
              type="button" 
              class="persona-chip chip-customer"
              (click)="quickSignIn('customer')"
            >
              <span class="chip-dot"></span>
              <span class="chip-name">Customer (Emma)</span>
            </button>
          </div>
        </div>

        <div class="divider">
          <span>OR SIGN IN WITH CREDENTIALS</span>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="rf-form-group">
            <label class="rf-label">Work Email</label>
            <input 
              type="email" 
              class="rf-input" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="e.g. admin@retailflow.com" 
              required
            />
          </div>

          <div class="rf-form-group">
            <label class="rf-label">Password</label>
            <input 
              type="password" 
              class="rf-input" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="••••••••" 
              required
            />
          </div>

          <button 
            type="submit" 
            class="rf-btn rf-btn-primary w-full" 
            [disabled]="loading || !email || !password"
          >
            <span *ngIf="loading">Signing in to workspace...</span>
            <span *ngIf="!loading">Sign In to Dashboard</span>
          </button>
        </form>

        <div class="login-footer">
          <span>Connected to Spring Boot API & MySQL database</span>
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
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #090d16 100%);
      padding: 1.5rem;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: var(--radius-lg);
      padding: 2.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .login-header {
      text-align: center;
      margin-bottom: 1.75rem;
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
      margin-bottom: 0.875rem;
      box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
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

    .demo-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .demo-title {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #64748b;
      margin-bottom: 0.625rem;
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
      padding: 0.5rem 0.625rem;
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
      margin: 1.5rem 0;
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

    .login-form {
      margin-bottom: 1.5rem;
    }

    .login-footer {
      text-align: center;
      font-size: 0.75rem;
      color: #94a3b8;
    }
  `]
})
export class LoginComponent {
  email = 'admin@retailflow.com';
  password = 'admin123';
  loading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.notificationService.success(`Welcome back, ${res.user.firstName}! Signed in as ${res.user.role?.roleName?.toUpperCase()}.`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Invalid credentials or user inactive.');
      }
    });
  }

  quickSignIn(roleKey: 'admin' | 'manager' | 'retailer' | 'procurement' | 'customer') {
    this.loading = true;
    this.authService.loginWithDemo(roleKey).subscribe({
      next: (res) => {
        this.loading = false;
        this.notificationService.success(`Signed in as ${res.user.firstName} (${res.user.role?.roleName?.toUpperCase()}).`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.error(err.error?.message || 'Failed to authenticate demo user.');
      }
    });
  }
}
