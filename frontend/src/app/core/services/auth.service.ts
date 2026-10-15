import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/models';

export interface DemoUserOption {
  email: string;
  name: string;
  role: string;
  badge: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public readonly DEMO_USERS: Record<string, DemoUserOption> = {
    admin: {
      email: 'admin@retailflow.com',
      name: 'Alex Vance',
      role: 'admin',
      badge: 'Super Admin',
      description: 'System-wide visibility, user & warehouse control'
    },
    manager: {
      email: 'manager@retailflow.com',
      name: 'Marcus Lee',
      role: 'manager',
      badge: 'Warehouse Manager',
      description: 'Stock levels, transfers, receiving orders'
    },
    retailer: {
      email: 'retailer@retailflow.com',
      name: 'Sophia Patel',
      role: 'retailer',
      badge: 'Store Retailer',
      description: 'Product catalog, stock check, customer sales'
    },
    procurement: {
      email: 'procurement@retailflow.com',
      name: 'David Miller',
      role: 'procurement',
      badge: 'Procurement Specialist',
      description: 'Suppliers, purchase orders & receiving'
    },
    customer: {
      email: 'customer@retailflow.com',
      name: 'Emma Watson',
      role: 'customer',
      badge: 'Customer',
      description: 'Browse available products & order status'
    }
  };

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  private restoreSession() {
    const savedUser = localStorage.getItem('rf_user');
    const token = localStorage.getItem('rf_token');
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser) as User;
        if (!user.role && (user as any).roleName) {
          user.role = { roleName: (user as any).roleName, description: (user as any).roleDescription };
        }
        this.currentUserSubject.next(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('rf_token');
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!this.token;
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res && res.token && res.user) {
          if (!res.user.role && (res.user as any).roleName) {
            res.user.role = { roleName: (res.user as any).roleName, description: (res.user as any).roleDescription };
          }
          localStorage.setItem('rf_token', res.token);
          localStorage.setItem('rf_user', JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  loginWithDemo(roleKey: 'admin' | 'manager' | 'retailer' | 'procurement' | 'customer'): Observable<AuthResponse> {
    const passwords: Record<string, string> = {
      admin: 'admin123',
      manager: 'manager123',
      retailer: 'retail123',
      procurement: 'procure123',
      customer: 'customer123'
    };
    const demo = this.DEMO_USERS[roleKey];
    return this.login({
      email: demo.email,
      password: passwords[roleKey] || 'admin123'
    });
  }

  logout() {
    localStorage.removeItem('rf_token');
    localStorage.removeItem('rf_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  hasRole(allowedRoles: string[]): boolean {
    const roleName = this.getActiveRoleName();
    if (roleName === 'guest') return false;
    return allowedRoles.some((r) => r.toLowerCase() === roleName);
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUser;
    if (!user || !user.permissions) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  }

  getActiveRoleName(): string {
    const user = this.currentUser;
    const name = user?.role?.roleName || (user as any)?.roleName;
    return name ? name.toLowerCase() : 'guest';
  }
}
