import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomerOrderService } from '../../../core/services/customer-order.service';
import { OrderItemService } from '../../../core/services/order-item.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerOrder, OrderItem } from '../../../core/models/models';

@Component({
  selector: 'app-customer-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Customer Sales Orders</h1>
          <p class="page-subtitle">Retail storefront orders, customer shipping details, and order fulfillment</p>
        </div>

        <div class="page-actions" *ngIf="canCreateOrder()">
          <a routerLink="/customer-orders/new" class="rf-btn rf-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Customer Order</span>
          </a>
        </div>
      </div>

      <!-- Filters & Toolbar -->
      <div class="rf-toolbar">
        <div class="rf-search-box">
          <svg class="rf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            placeholder="Search order #, customer name, or email..." 
            class="rf-input"
          />
        </div>

        <div class="rf-filter-group">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="rf-select" style="min-width: 170px;">
            <option value="ALL">All Order Statuses</option>
            <option value="PLACED">PLACED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <!-- Table View -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Contact Phone</th>
              <th>Fulfillment Hub</th>
              <th>Order Placed</th>
              <th class="text-right">Order Total</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders">
              <td>
                <span class="font-mono font-bold text-main">#ORD-{{ order.orderId }}</span>
              </td>
              <td>
                <div class="font-semibold text-main">{{ order.customerName }}</div>
                <div class="text-muted" style="font-size: 0.75rem;">{{ order.customerEmail || 'No email' }}</div>
              </td>
              <td class="font-mono text-muted" style="font-size: 0.8125rem;">
                {{ order.customerPhone || '—' }}
              </td>
              <td>
                <span class="warehouse-tag">{{ order.warehouse?.warehouseName }}</span>
              </td>
              <td class="text-muted font-mono" style="font-size: 0.8125rem;">
                {{ formatDateTime(order.orderDate) }}
              </td>
              <td class="text-right font-bold text-main">
                \${{ order.totalAmount | number:'1.2-2' }}
              </td>
              <td>
                <span class="rf-badge" [ngClass]="getOrderBadge(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="text-right">
                <button (click)="viewOrderInvoice(order)" class="rf-btn rf-btn-secondary rf-btn-sm">
                  View Invoice & Items
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredOrders.length === 0" class="rf-empty-state">
          <div class="rf-empty-icon">🛍️</div>
          <div class="rf-empty-title">No customer orders found</div>
          <div class="rf-empty-description">Create an order to initiate customer sales and dispatch stock.</div>
          <a *ngIf="canCreateOrder()" routerLink="/customer-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">
            Place First Order
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>

      <!-- Invoice Detail Modal -->
      <div class="rf-modal-backdrop" *ngIf="selectedOrder">
        <div class="rf-modal" style="max-width: 680px;">
          <div class="rf-modal-header">
            <div>
              <div class="rf-modal-title">Sales Invoice #ORD-{{ selectedOrder.orderId }}</div>
              <div class="text-muted" style="font-size: 0.8125rem;">
                Placed by {{ selectedOrder.customerName }} on {{ formatDateTime(selectedOrder.orderDate) }}
              </div>
            </div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="selectedOrder = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <!-- Customer Shipping Card -->
            <div class="invoice-meta-card">
              <div class="invoice-meta-col">
                <span class="meta-label">Customer Details</span>
                <span class="meta-val font-semibold">{{ selectedOrder.customerName }}</span>
                <span class="meta-sub font-mono">{{ selectedOrder.customerEmail }}</span>
                <span class="meta-sub font-mono">{{ selectedOrder.customerPhone }}</span>
              </div>
              <div class="invoice-meta-col">
                <span class="meta-label">Shipping Destination</span>
                <span class="meta-val">{{ selectedOrder.shippingAddress || 'Store Pickup' }}</span>
                <span class="meta-sub">Dispatched from: {{ selectedOrder.warehouse?.warehouseName }}</span>
              </div>
            </div>

            <!-- Items Table -->
            <h3 style="font-size: 0.875rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">
              Purchased Items & Totals
            </h3>

            <div *ngIf="loadingItems" style="padding: 1rem 0;">
              <div class="rf-skeleton" style="height: 36px; margin-bottom: 6px;"></div>
              <div class="rf-skeleton" style="height: 36px;"></div>
            </div>

            <table class="rf-table" *ngIf="!loadingItems && orderItems.length > 0">
              <thead>
                <tr>
                  <th>Item SKU & Description</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of orderItems">
                  <td>
                    <div class="font-semibold">{{ item.product?.productName }}</div>
                    <div class="font-mono text-muted" style="font-size: 0.75rem;">{{ item.product?.sku }}</div>
                  </td>
                  <td class="text-right font-bold">{{ item.quantity }}</td>
                  <td class="text-right text-muted">\${{ item.unitPrice | number:'1.2-2' }}</td>
                  <td class="text-right font-bold text-main">\${{ item.subtotal | number:'1.2-2' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right font-bold" style="padding: 1rem; border-top: 2px solid var(--border);">Total Amount:</td>
                  <td class="text-right font-bold text-main" style="padding: 1rem; font-size: 1.125rem; border-top: 2px solid var(--border);">
                    \${{ selectedOrder.totalAmount | number:'1.2-2' }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div *ngIf="!loadingItems && orderItems.length === 0" class="rf-empty-state" style="padding: 1.5rem;">
              <div class="rf-empty-title">Total Order Value: \${{ selectedOrder.totalAmount | number:'1.2-2' }}</div>
              <div class="rf-empty-description">Single-checkout package without detailed line breakups.</div>
            </div>

            <!-- Status Transition Actions -->
            <div class="status-action-row" *ngIf="canUpdateStatus()">
              <span class="status-label">Update Fulfillment Status:</span>
              <div class="flex gap-2">
                <button 
                  *ngIf="selectedOrder.status === 'PLACED'" 
                  (click)="updateStatus(selectedOrder, 'PROCESSING')" 
                  class="rf-btn rf-btn-secondary rf-btn-sm"
                >
                  Mark Processing
                </button>
                <button 
                  *ngIf="selectedOrder.status === 'PROCESSING' || selectedOrder.status === 'PLACED'" 
                  (click)="updateStatus(selectedOrder, 'COMPLETED')" 
                  class="rf-btn rf-btn-primary rf-btn-sm"
                >
                  Mark Completed / Delivered
                </button>
                <button 
                  *ngIf="selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED'" 
                  (click)="updateStatus(selectedOrder, 'CANCELLED')" 
                  class="rf-btn rf-btn-danger rf-btn-sm"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="selectedOrder = null">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warehouse-tag {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #334155;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }

    .invoice-meta-card {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      background: var(--surface-subtle);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }

    .invoice-meta-col {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .meta-label {
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .meta-val {
      font-size: 0.875rem;
      color: var(--text-main);
    }

    .meta-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .status-action-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .status-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
    }
  `]
})
export class CustomerOrderListComponent implements OnInit {
  orders: CustomerOrder[] = [];
  filteredOrders: CustomerOrder[] = [];
  searchQuery = '';
  statusFilter = 'ALL';
  loading = true;

  selectedOrder: CustomerOrder | null = null;
  orderItems: OrderItem[] = [];
  loadingItems = false;

  constructor(
    private orderService: CustomerOrderService,
    private itemService: OrderItemService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load customer orders');
      }
    });
  }

  applyFilters() {
    let result = [...this.orders];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        o => (`#ord-${o.orderId}`.includes(q)) ||
             (o.customerName && o.customerName.toLowerCase().includes(q)) ||
             (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
      );
    }

    if (this.statusFilter !== 'ALL') {
      result = result.filter(o => o.status === this.statusFilter);
    }

    this.filteredOrders = result;
  }

  formatDateTime(isoDate?: string): string {
    if (!isoDate) return '—';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoDate;
    }
  }

  getOrderBadge(status?: string): string {
    switch (status) {
      case 'COMPLETED': return 'rf-badge-success';
      case 'PROCESSING': return 'rf-badge-warning';
      case 'PLACED': return 'rf-badge-info';
      case 'CANCELLED': return 'rf-badge-danger';
      default: return 'rf-badge-neutral';
    }
  }

  canCreateOrder(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('retail') || role.includes('customer') || role.includes('store');
  }

  canUpdateStatus(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('retail') || role.includes('manager');
  }

  viewOrderInvoice(order: CustomerOrder) {
    this.selectedOrder = order;
    if (!order.orderId) return;
    this.loadingItems = true;
    this.itemService.getByOrderId(order.orderId).subscribe({
      next: (items) => {
        this.orderItems = items || [];
        this.loadingItems = false;
      },
      error: () => {
        this.orderItems = [];
        this.loadingItems = false;
      }
    });
  }

  updateStatus(order: CustomerOrder, newStatus: string) {
    if (!order.orderId) return;
    const updated = { ...order, status: newStatus };
    this.orderService.update(order.orderId, updated).subscribe({
      next: () => {
        this.notificationService.success(`Order #ORD-${order.orderId} status updated to ${newStatus}.`);
        if (this.selectedOrder) {
          this.selectedOrder.status = newStatus;
        }
        this.loadOrders();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to update order status');
      }
    });
  }
}
