import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { PurchaseOrderItemService } from '../../../core/services/purchase-order-item.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PurchaseOrder, PurchaseOrderItem } from '../../../core/models/models';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Purchase Orders & Inbound Shipments</h1>
          <p class="page-subtitle">Vendor replenishment lifecycle, line items, and warehouse receiving</p>
        </div>

        <div class="page-actions" *ngIf="canCreatePO()">
          <a routerLink="/purchase-orders/new" class="rf-btn rf-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Create Purchase Order</span>
          </a>
        </div>
      </div>

      <!-- Filters & Status Toolbar -->
      <div class="rf-toolbar">
        <div class="rf-search-box">
          <svg class="rf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            placeholder="Search PO #, supplier, or warehouse..." 
            class="rf-input"
          />
        </div>

        <div class="rf-filter-group">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="rf-select" style="min-width: 170px;">
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="RECEIVED">RECEIVED (In Stock)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <!-- Table View -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Destination Warehouse</th>
              <th>Order Date</th>
              <th>Expected Date</th>
              <th class="text-right">Total Amount</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let po of filteredOrders">
              <td>
                <span class="font-mono font-bold text-main">#PO-{{ po.purchaseOrderId }}</span>
              </td>
              <td>
                <div class="font-semibold text-main">{{ po.supplier.supplierName }}</div>
                <div class="text-muted" style="font-size: 0.75rem;">{{ po.supplier.contactPerson }}</div>
              </td>
              <td>
                <span class="warehouse-tag">{{ po.warehouse.warehouseName }}</span>
              </td>
              <td class="text-muted font-mono" style="font-size: 0.8125rem;">
                {{ po.orderDate }}
              </td>
              <td class="text-muted font-mono" style="font-size: 0.8125rem;">
                {{ po.expectedDate || '—' }}
              </td>
              <td class="text-right font-bold text-main">
                \${{ po.totalAmount | number:'1.2-2' }}
              </td>
              <td>
                <span class="rf-badge" [ngClass]="getBadgeClass(po.status)">
                  {{ po.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <button (click)="viewDetails(po)" class="rf-btn rf-btn-secondary rf-btn-sm">
                    View Items
                  </button>
                  <button 
                    *ngIf="canReceive(po)" 
                    (click)="receiveOrder(po)" 
                    class="rf-btn rf-btn-primary rf-btn-sm"
                    title="Mark order received and automatically credit inventory"
                  >
                    Receive Stock
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredOrders.length === 0" class="rf-empty-state">
          <div class="rf-empty-icon">📄</div>
          <div class="rf-empty-title">No purchase orders found</div>
          <div class="rf-empty-description">Create replenishment orders to restock warehouse inventory.</div>
          <a *ngIf="canCreatePO()" routerLink="/purchase-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">
            Create First Purchase Order
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>

      <!-- Order Detail Modal -->
      <div class="rf-modal-backdrop" *ngIf="selectedOrder">
        <div class="rf-modal" style="max-width: 680px;">
          <div class="rf-modal-header">
            <div>
              <div class="rf-modal-title">Purchase Order #PO-{{ selectedOrder.purchaseOrderId }}</div>
              <div class="text-muted" style="font-size: 0.8125rem;">
                Issued to {{ selectedOrder.supplier.supplierName }} on {{ selectedOrder.orderDate }}
              </div>
            </div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="selectedOrder = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <!-- Header Meta Grid -->
            <div class="po-meta-grid">
              <div class="po-meta-item">
                <span class="meta-label">Destination Facility</span>
                <span class="meta-val">{{ selectedOrder.warehouse.warehouseName }} ({{ selectedOrder.warehouse.location }})</span>
              </div>
              <div class="po-meta-item">
                <span class="meta-label">Expected Delivery</span>
                <span class="meta-val font-mono">{{ selectedOrder.expectedDate || 'Not specified' }}</span>
              </div>
              <div class="po-meta-item">
                <span class="meta-label">Current Status</span>
                <span class="rf-badge" [ngClass]="getBadgeClass(selectedOrder.status)">
                  {{ selectedOrder.status }}
                </span>
              </div>
              <div class="po-meta-item">
                <span class="meta-label">Created By</span>
                <span class="meta-val">{{ selectedOrder.createdBy?.firstName || 'System' }} {{ selectedOrder.createdBy?.lastName || '' }}</span>
              </div>
            </div>

            <!-- Line Items -->
            <h3 style="font-size: 0.875rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">
              Line Items & Inbound Quantities
            </h3>

            <div *ngIf="loadingItems" style="padding: 1rem 0;">
              <div class="rf-skeleton" style="height: 36px; margin-bottom: 6px;"></div>
              <div class="rf-skeleton" style="height: 36px;"></div>
            </div>

            <table class="rf-table" *ngIf="!loadingItems && orderItems.length > 0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of orderItems">
                  <td class="font-semibold">{{ item.product.productName }}</td>
                  <td class="font-mono text-muted">{{ item.product.sku }}</td>
                  <td class="text-right font-bold">{{ item.quantity }}</td>
                  <td class="text-right text-muted">\${{ item.unitPrice | number:'1.2-2' }}</td>
                  <td class="text-right font-bold text-main">\${{ item.subtotal | number:'1.2-2' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right font-bold" style="padding: 1rem; border-top: 2px solid var(--border);">Total PO Valuation:</td>
                  <td class="text-right font-bold text-main" style="padding: 1rem; font-size: 1.0625rem; border-top: 2px solid var(--border);">
                    \${{ selectedOrder.totalAmount | number:'1.2-2' }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div *ngIf="!loadingItems && orderItems.length === 0" class="rf-empty-state" style="padding: 1.5rem;">
              <div class="rf-empty-title">Order summary valuation: \${{ selectedOrder.totalAmount | number:'1.2-2' }}</div>
              <div class="rf-empty-description">Single-line shipment or items already archived.</div>
            </div>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="selectedOrder = null">Close</button>
            <button 
              *ngIf="canReceive(selectedOrder)" 
              (click)="receiveOrder(selectedOrder)" 
              class="rf-btn rf-btn-primary"
            >
              Confirm Goods Receipt & Update Inventory
            </button>
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

    .po-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      background: var(--surface-subtle);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }

    .po-meta-item {
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
      font-weight: 600;
      color: var(--text-main);
    }
  `]
})
export class PurchaseOrderListComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  searchQuery = '';
  statusFilter = 'ALL';
  loading = true;

  selectedOrder: PurchaseOrder | null = null;
  orderItems: PurchaseOrderItem[] = [];
  loadingItems = false;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private itemService: PurchaseOrderItemService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.purchaseOrderService.getAll().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load purchase orders');
      }
    });
  }

  applyFilters() {
    let result = [...this.orders];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        po => (`#po-${po.purchaseOrderId}`.includes(q)) ||
              (po.supplier?.supplierName && po.supplier.supplierName.toLowerCase().includes(q)) ||
              (po.warehouse?.warehouseName && po.warehouse.warehouseName.toLowerCase().includes(q))
      );
    }

    if (this.statusFilter !== 'ALL') {
      result = result.filter(po => po.status === this.statusFilter);
    }

    this.filteredOrders = result;
  }

  getBadgeClass(status?: string): string {
    switch (status) {
      case 'RECEIVED': return 'rf-badge-success';
      case 'APPROVED': return 'rf-badge-info';
      case 'PENDING': return 'rf-badge-warning';
      case 'CANCELLED': return 'rf-badge-danger';
      default: return 'rf-badge-neutral';
    }
  }

  canCreatePO(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('procure') || role.includes('manager');
  }

  canReceive(po: PurchaseOrder): boolean {
    const role = this.authService.getActiveRoleName();
    const canRole = role.includes('admin') || role.includes('manager') || role.includes('procure');
    return canRole && (po.status === 'PENDING' || po.status === 'APPROVED');
  }

  viewDetails(po: PurchaseOrder) {
    this.selectedOrder = po;
    if (!po.purchaseOrderId) return;
    this.loadingItems = true;
    this.itemService.getByOrderId(po.purchaseOrderId).subscribe({
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

  receiveOrder(po: PurchaseOrder) {
    if (!po.purchaseOrderId) return;
    const updated = { ...po, status: 'RECEIVED' };
    this.purchaseOrderService.update(po.purchaseOrderId, updated).subscribe({
      next: () => {
        this.notificationService.success(`PO #${po.purchaseOrderId} marked RECEIVED. Warehouse inventory updated.`);
        this.selectedOrder = null;
        this.loadOrders();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to receive order');
      }
    });
  }
}
