import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <h2>RetailFlow</h2>
      </div>
      <nav class="nav-menu">
        <ul>
          <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
          
          <li class="nav-header">INVENTORY</li>
          <li><a routerLink="/products" routerLinkActive="active">Products</a></li>
          <li><a routerLink="/categories" routerLinkActive="active">Categories</a></li>
          <li><a routerLink="/inventory" routerLinkActive="active">Stock Levels</a></li>
          
          <li class="nav-header">OPERATIONS</li>
          <li><a routerLink="/warehouses" routerLinkActive="active">Warehouses</a></li>
          <li><a routerLink="/suppliers" routerLinkActive="active">Suppliers</a></li>
          
          <li class="nav-header">ORDERS</li>
          <li><a routerLink="/purchase-orders" routerLinkActive="active">Purchase Orders</a></li>
          <li><a routerLink="/customer-orders" routerLinkActive="active">Customer Orders</a></li>
          <li><a routerLink="/stock-transfers" routerLinkActive="active">Stock Transfers</a></li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background-color: #1e293b;
      color: #f8fafc;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
      z-index: 10;
    }
    .logo {
      padding: 1.5rem;
      border-bottom: 1px solid #334155;
    }
    .logo h2 {
      margin: 0;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
    }
    .nav-menu {
      padding: 1rem 0;
    }
    .nav-header {
      padding: 1.5rem 1.5rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nav-menu ul li a {
      display: block;
      padding: 0.75rem 1.5rem;
      color: #cbd5e1;
      transition: all 0.2s;
    }
    .nav-menu ul li a:hover, .nav-menu ul li a.active {
      background-color: #334155;
      color: white;
      border-left: 4px solid var(--primary-color);
    }
  `]
})
export class SidebarComponent { }
