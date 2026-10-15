import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Warehouse, Inventory } from '../../../core/models/models';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Warehouses & Fulfillment Centers</h1>
          <p class="page-subtitle">Multi-location distribution facilities, site managers, and physical capacity</p>
        </div>

        <div class="page-actions" *ngIf="canManageWarehouses()">
          <button (click)="openAddModal()" class="rf-btn rf-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Warehouse</span>
          </button>
        </div>
      </div>

      <!-- Warehouse Grid Cards -->
      <div class="warehouses-grid" *ngIf="!loading">
        <div class="warehouse-card rf-card" *ngFor="let wh of warehouses">
          <div class="wh-card-top">
            <div class="wh-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            </div>
            <div class="wh-meta">
              <span class="rf-badge" [ngClass]="wh.status === 'ACTIVE' ? 'rf-badge-success' : 'rf-badge-neutral'">
                {{ wh.status }}
              </span>
            </div>
          </div>

          <div class="wh-title">{{ wh.warehouseName }}</div>
          <div class="wh-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{{ wh.location }}</span>
          </div>

          <div class="wh-details-list">
            <div class="wh-detail-row">
              <span class="detail-label">Site Manager</span>
              <span class="detail-val">{{ wh.managerName || 'Unassigned' }}</span>
            </div>
            <div class="wh-detail-row">
              <span class="detail-label">Contact Phone</span>
              <span class="detail-val font-mono">{{ wh.contactNumber || '—' }}</span>
            </div>
            <div class="wh-detail-row">
              <span class="detail-label">Stocked SKUs</span>
              <span class="detail-val font-bold text-main">{{ getWarehouseSkuCount(wh.warehouseId) }} items</span>
            </div>
            <div class="wh-detail-row">
              <span class="detail-label">Total Units</span>
              <span class="detail-val font-bold text-main">{{ getWarehouseTotalUnits(wh.warehouseId) }} units</span>
            </div>
          </div>

          <div class="wh-card-actions">
            <button (click)="viewWarehouseInventory(wh)" class="rf-btn rf-btn-secondary rf-btn-sm" style="flex: 1;">
              View Stock
            </button>
            <button *ngIf="canManageWarehouses()" (click)="openEditModal(wh)" class="rf-btn rf-btn-ghost rf-btn-sm">
              Edit
            </button>
            <button *ngIf="isAdmin()" (click)="confirmDelete(wh)" class="rf-btn rf-btn-ghost rf-btn-sm text-danger">
              Delete
            </button>
          </div>
        </div>

        <div *ngIf="warehouses.length === 0" class="rf-empty-state" style="grid-column: 1 / -1;">
          <div class="rf-empty-icon">🏢</div>
          <div class="rf-empty-title">No warehouses registered</div>
          <div class="rf-empty-description">Add distribution hubs to manage regional inventory.</div>
          <button (click)="openAddModal()" class="rf-btn rf-btn-primary rf-btn-sm">Add Warehouse</button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="warehouses-grid">
        <div class="rf-skeleton" style="height: 260px;"></div>
        <div class="rf-skeleton" style="height: 260px;"></div>
      </div>

      <!-- Warehouse Stock Drawer / Modal -->
      <div class="rf-modal-backdrop" *ngIf="selectedWarehouseForStock">
        <div class="rf-modal" style="max-width: 650px;">
          <div class="rf-modal-header">
            <div>
              <div class="rf-modal-title">{{ selectedWarehouseForStock.warehouseName }} Inventory</div>
              <div class="text-muted" style="font-size: 0.8125rem;">{{ selectedWarehouseForStock.location }}</div>
            </div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="selectedWarehouseForStock = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <table class="rf-table" *ngIf="warehouseInventories.length > 0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Reserved</th>
                  <th class="text-right">Available</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of warehouseInventories">
                  <td class="font-semibold">{{ item.product.productName }}</td>
                  <td class="font-mono text-muted">{{ item.product.sku }}</td>
                  <td class="text-right font-bold">{{ item.quantity }}</td>
                  <td class="text-right text-muted">{{ item.reservedQuantity }}</td>
                  <td class="text-right font-bold text-success">{{ item.quantity - item.reservedQuantity }}</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="warehouseInventories.length === 0" class="rf-empty-state" style="padding: 2rem 1rem;">
              <div class="rf-empty-title">No inventory stocked at this location</div>
              <div class="rf-empty-description">Create a stock transfer or purchase order to populate this warehouse.</div>
            </div>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="selectedWarehouseForStock = null">Close</button>
            <a routerLink="/stock-transfers/new" class="rf-btn rf-btn-primary" (click)="selectedWarehouseForStock = null">
              Transfer Stock Here
            </a>
          </div>
        </div>
      </div>

      <!-- Add/Edit Warehouse Modal -->
      <div class="rf-modal-backdrop" *ngIf="showModal">
        <div class="rf-modal" style="max-width: 520px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">{{ isEdit ? 'Edit Warehouse' : 'Add New Warehouse' }}</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="showModal = false">✕</button>
          </div>
          <form (ngSubmit)="saveWarehouse()" class="rf-modal-body">
            <div class="rf-form-group">
              <label class="rf-label">Warehouse Name *</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="currentWarehouse.warehouseName" 
                name="name" 
                placeholder="e.g. North Region Logistics Hub"
                required
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Physical Location / Address *</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="currentWarehouse.location" 
                name="loc" 
                placeholder="e.g. Sector 62, Noida, Uttar Pradesh"
                required
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Manager Name</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="currentWarehouse.managerName" 
                name="mgr" 
                placeholder="e.g. Rajesh Verma"
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Contact Phone</label>
              <input 
                type="text" 
                class="rf-input font-mono" 
                [(ngModel)]="currentWarehouse.contactNumber" 
                name="phone" 
                placeholder="+91 98765 43210"
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Operational Status</label>
              <select class="rf-select" [(ngModel)]="currentWarehouse.status" name="status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div class="rf-modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
              <button type="button" class="rf-btn rf-btn-secondary" (click)="showModal = false">Cancel</button>
              <button type="submit" class="rf-btn rf-btn-primary" [disabled]="saving || !currentWarehouse.warehouseName || !currentWarehouse.location">
                <span *ngIf="saving">Saving...</span>
                <span *ngIf="!saving">{{ isEdit ? 'Update Warehouse' : 'Create Warehouse' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <div class="rf-modal-backdrop" *ngIf="warehouseToDelete">
        <div class="rf-modal" style="max-width: 440px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">Delete Warehouse</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="warehouseToDelete = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
              Are you sure you want to delete warehouse <strong>{{ warehouseToDelete.warehouseName }}</strong>?
            </p>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="warehouseToDelete = null">Cancel</button>
            <button class="rf-btn rf-btn-danger" (click)="deleteConfirmed()">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warehouses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .warehouse-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    .wh-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .wh-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: #eef2ff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wh-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .wh-location {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

    .wh-details-list {
      background: var(--surface-subtle);
      border-radius: var(--radius-md);
      padding: 0.875rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      flex: 1;
    }

    .wh-detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8125rem;
    }

    .detail-label {
      color: var(--text-muted);
    }

    .detail-val {
      color: var(--text-main);
    }

    .wh-card-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }

    .text-danger { color: #dc2626; }
    .text-success { color: #059669; }
  `]
})
export class WarehouseListComponent implements OnInit {
  warehouses: Warehouse[] = [];
  inventories: Inventory[] = [];
  loading = true;

  selectedWarehouseForStock: Warehouse | null = null;
  warehouseInventories: Inventory[] = [];

  showModal = false;
  isEdit = false;
  saving = false;
  currentWarehouse: Warehouse = { warehouseName: '', location: '', status: 'ACTIVE' };
  warehouseToDelete: Warehouse | null = null;

  constructor(
    private warehouseService: WarehouseService,
    private inventoryService: InventoryService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      warehouses: this.warehouseService.getAll(),
      inventories: this.inventoryService.getAll()
    }).subscribe({
      next: (res) => {
        this.warehouses = res.warehouses || [];
        this.inventories = res.inventories || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load warehouses');
      }
    });
  }

  getWarehouseSkuCount(whId?: number): number {
    if (!whId) return 0;
    return this.inventories.filter(i => i.warehouse?.warehouseId === whId).length;
  }

  getWarehouseTotalUnits(whId?: number): number {
    if (!whId) return 0;
    return this.inventories
      .filter(i => i.warehouse?.warehouseId === whId)
      .reduce((sum, i) => sum + (i.quantity || 0), 0);
  }

  viewWarehouseInventory(wh: Warehouse) {
    this.selectedWarehouseForStock = wh;
    this.warehouseInventories = this.inventories.filter(
      i => i.warehouse?.warehouseId === wh.warehouseId
    );
  }

  canManageWarehouses(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('manager');
  }

  isAdmin(): boolean {
    return this.authService.getActiveRoleName().includes('admin');
  }

  openAddModal() {
    this.isEdit = false;
    this.currentWarehouse = { warehouseName: '', location: '', status: 'ACTIVE' };
    this.showModal = true;
  }

  openEditModal(wh: Warehouse) {
    this.isEdit = true;
    this.currentWarehouse = { ...wh };
    this.showModal = true;
  }

  saveWarehouse() {
    if (!this.currentWarehouse.warehouseName || !this.currentWarehouse.location) return;
    this.saving = true;

    if (this.isEdit && this.currentWarehouse.warehouseId) {
      this.warehouseService.update(this.currentWarehouse.warehouseId, this.currentWarehouse).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.notificationService.success(`Warehouse "${this.currentWarehouse.warehouseName}" updated.`);
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to update warehouse');
        }
      });
    } else {
      this.warehouseService.create(this.currentWarehouse).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.notificationService.success(`Warehouse "${this.currentWarehouse.warehouseName}" created.`);
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to create warehouse');
        }
      });
    }
  }

  confirmDelete(wh: Warehouse) {
    this.warehouseToDelete = wh;
  }

  deleteConfirmed() {
    if (!this.warehouseToDelete?.warehouseId) return;
    this.warehouseService.delete(this.warehouseToDelete.warehouseId).subscribe({
      next: () => {
        this.notificationService.success(`Warehouse "${this.warehouseToDelete?.warehouseName}" deleted.`);
        this.warehouseToDelete = null;
        this.loadData();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to delete warehouse');
        this.warehouseToDelete = null;
      }
    });
  }
}
