import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InventoryService } from '../../../core/services/inventory.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Inventory, Warehouse, Product } from '../../../core/models/models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Inventory & Stock Levels</h1>
          <p class="page-subtitle">Real-time multi-warehouse availability, reservations, and reorder levels</p>
        </div>

        <div class="page-actions" *ngIf="canAdjustStock()">
          <button (click)="openNewStockModal()" class="rf-btn rf-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Assign Initial Stock</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="rf-toolbar">
        <div class="rf-search-box">
          <svg class="rf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            placeholder="Search SKU or product name..." 
            class="rf-input"
          />
        </div>

        <div class="rf-filter-group">
          <select [(ngModel)]="selectedWarehouse" (change)="applyFilters()" class="rf-select" style="min-width: 180px;">
            <option value="">All Warehouses</option>
            <option *ngFor="let wh of warehouses" [value]="wh.warehouseId">{{ wh.warehouseName }}</option>
          </select>

          <select [(ngModel)]="selectedStockStatus" (change)="applyFilters()" class="rf-select" style="min-width: 160px;">
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low Stock Only</option>
            <option value="IN_STOCK">Adequate Stock</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>Product SKU & Name</th>
              <th>Warehouse</th>
              <th class="text-right">On Hand</th>
              <th class="text-right">Reserved</th>
              <th class="text-right">Available</th>
              <th class="text-center">Threshold</th>
              <th>Stock State</th>
              <th class="text-right" *ngIf="canAdjustStock()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let inv of filteredInventory">
              <td>
                <div class="font-semibold text-main">{{ inv.product?.productName }}</div>
                <div class="font-mono text-muted" style="font-size: 0.75rem;">{{ inv.product?.sku }}</div>
              </td>
              <td>
                <span class="warehouse-tag">{{ inv.warehouse?.warehouseName }}</span>
              </td>
              <td class="text-right font-bold text-main">
                {{ inv.quantity }}
              </td>
              <td class="text-right text-muted">
                {{ inv.reservedQuantity }}
              </td>
              <td class="text-right font-bold" [ngClass]="getAvailableStock(inv) <= 0 ? 'text-danger' : 'text-success'">
                {{ getAvailableStock(inv) }}
              </td>
              <td class="text-center text-muted font-mono" style="font-size: 0.8125rem;">
                {{ inv.product?.reorderLevel || 10 }}
              </td>
              <td>
                <span class="rf-badge" [ngClass]="getStockBadgeClass(inv)">
                  {{ getStockStateText(inv) }}
                </span>
              </td>
              <td class="text-right" *ngIf="canAdjustStock()">
                <div class="flex items-center justify-end gap-2">
                  <button (click)="openAdjustModal(inv)" class="rf-btn rf-btn-secondary rf-btn-sm">
                    Adjust Stock
                  </button>
                  <a [routerLink]="['/purchase-orders/new']" class="rf-btn rf-btn-primary rf-btn-sm" *ngIf="isLowStock(inv)">
                    Reorder
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredInventory.length === 0" class="rf-empty-state">
          <div class="rf-empty-icon">📊</div>
          <div class="rf-empty-title">No inventory records found</div>
          <div class="rf-empty-description">Try changing your filters or assign new stock to a warehouse.</div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>

      <!-- Adjust Stock Modal -->
      <div class="rf-modal-backdrop" *ngIf="adjustingInventory">
        <div class="rf-modal" style="max-width: 480px;">
          <div class="rf-modal-header">
            <div>
              <div class="rf-modal-title">Adjust Warehouse Stock</div>
              <div class="text-muted" style="font-size: 0.8125rem;">
                {{ adjustingInventory.product?.productName }} ({{ adjustingInventory.warehouse?.warehouseName }})
              </div>
            </div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="adjustingInventory = null">✕</button>
          </div>
          <form (ngSubmit)="saveStockAdjustment()" class="rf-modal-body">
            <div class="rf-form-group">
              <label class="rf-label">New Total On-Hand Quantity *</label>
              <input 
                type="number" 
                min="0" 
                class="rf-input font-bold" 
                [(ngModel)]="adjustmentQuantity" 
                name="newQty"
                required
              />
              <span class="rf-form-hint">Currently on hand: {{ adjustingInventory.quantity }} units</span>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Reserved Quantity</label>
              <input 
                type="number" 
                min="0" 
                class="rf-input" 
                [(ngModel)]="adjustmentReserved" 
                name="resQty"
              />
              <span class="rf-form-hint">Stock allocated to pending customer orders</span>
            </div>

            <div class="rf-modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
              <button type="button" class="rf-btn rf-btn-secondary" (click)="adjustingInventory = null">Cancel</button>
              <button type="submit" class="rf-btn rf-btn-primary" [disabled]="savingAdjustment">
                <span *ngIf="savingAdjustment">Updating Stock...</span>
                <span *ngIf="!savingAdjustment">Confirm Adjustment</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Assign New Stock Modal -->
      <div class="rf-modal-backdrop" *ngIf="showNewStockModal">
        <div class="rf-modal" style="max-width: 480px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">Assign Initial Stock</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="showNewStockModal = false">✕</button>
          </div>
          <form (ngSubmit)="createInitialStock()" class="rf-modal-body">
            <div class="rf-form-group">
              <label class="rf-label">Product SKU *</label>
              <select class="rf-select" [(ngModel)]="newStockProductId" name="prod" required>
                <option value="">Select a product</option>
                <option *ngFor="let p of products" [value]="p.productId">{{ p.productName }} ({{ p.sku }})</option>
              </select>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Destination Warehouse *</label>
              <select class="rf-select" [(ngModel)]="newStockWarehouseId" name="wh" required>
                <option value="">Select warehouse</option>
                <option *ngFor="let wh of warehouses" [value]="wh.warehouseId">{{ wh.warehouseName }}</option>
              </select>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Initial Quantity *</label>
              <input 
                type="number" 
                min="1" 
                class="rf-input" 
                [(ngModel)]="newStockQuantity" 
                name="qty" 
                required
              />
            </div>

            <div class="rf-modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
              <button type="button" class="rf-btn rf-btn-secondary" (click)="showNewStockModal = false">Cancel</button>
              <button type="submit" class="rf-btn rf-btn-primary" [disabled]="savingNewStock || !newStockProductId || !newStockWarehouseId">
                <span *ngIf="savingNewStock">Saving...</span>
                <span *ngIf="!savingNewStock">Add to Warehouse</span>
              </button>
            </div>
          </form>
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
    .text-danger { color: #dc2626; }
    .text-success { color: #059669; }
  `]
})
export class InventoryListComponent implements OnInit {
  inventory: Inventory[] = [];
  filteredInventory: Inventory[] = [];
  warehouses: Warehouse[] = [];
  products: Product[] = [];

  searchQuery = '';
  selectedWarehouse = '';
  selectedStockStatus = 'ALL';

  loading = true;

  // Adjustment Modal
  adjustingInventory: Inventory | null = null;
  adjustmentQuantity = 0;
  adjustmentReserved = 0;
  savingAdjustment = false;

  // New Stock Modal
  showNewStockModal = false;
  newStockProductId: any = '';
  newStockWarehouseId: any = '';
  newStockQuantity = 50;
  savingNewStock = false;

  constructor(
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['filter'] === 'low-stock') {
        this.selectedStockStatus = 'LOW';
      }
    });

    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      inventory: this.inventoryService.getAll(),
      warehouses: this.warehouseService.getAll(),
      products: this.productService.getAll()
    }).subscribe({
      next: (res) => {
        this.inventory = res.inventory || [];
        this.warehouses = res.warehouses || [];
        this.products = res.products || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load inventory data');
      }
    });
  }

  applyFilters() {
    let result = [...this.inventory];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        i => (i.product?.productName && i.product.productName.toLowerCase().includes(q)) ||
             (i.product?.sku && i.product.sku.toLowerCase().includes(q))
      );
    }

    if (this.selectedWarehouse) {
      result = result.filter(
        i => i.warehouse?.warehouseId === Number(this.selectedWarehouse)
      );
    }

    if (this.selectedStockStatus === 'LOW') {
      result = result.filter(i => this.isLowStock(i));
    } else if (this.selectedStockStatus === 'OUT') {
      result = result.filter(i => (i.quantity || 0) === 0);
    } else if (this.selectedStockStatus === 'IN_STOCK') {
      result = result.filter(i => !this.isLowStock(i) && (i.quantity || 0) > 0);
    }

    this.filteredInventory = result;
  }

  getAvailableStock(inv: Inventory): number {
    return Math.max(0, (inv.quantity || 0) - (inv.reservedQuantity || 0));
  }

  isLowStock(inv: Inventory): boolean {
    const threshold = inv.product?.reorderLevel ?? 10;
    return (inv.quantity || 0) <= threshold;
  }

  getStockBadgeClass(inv: Inventory): string {
    if ((inv.quantity || 0) === 0) return 'rf-badge-danger';
    if (this.isLowStock(inv)) return 'rf-badge-warning';
    return 'rf-badge-success';
  }

  getStockStateText(inv: Inventory): string {
    if ((inv.quantity || 0) === 0) return 'Out of Stock';
    if (this.isLowStock(inv)) return 'Low Stock';
    return 'In Stock';
  }

  canAdjustStock(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('manager');
  }

  openAdjustModal(inv: Inventory) {
    this.adjustingInventory = inv;
    this.adjustmentQuantity = inv.quantity || 0;
    this.adjustmentReserved = inv.reservedQuantity || 0;
  }

  saveStockAdjustment() {
    if (!this.adjustingInventory?.inventoryId) return;
    this.savingAdjustment = true;

    const updated: Inventory = {
      ...this.adjustingInventory,
      quantity: this.adjustmentQuantity,
      reservedQuantity: this.adjustmentReserved
    };

    this.inventoryService.update(this.adjustingInventory.inventoryId, updated).subscribe({
      next: () => {
        this.savingAdjustment = false;
        this.adjustingInventory = null;
        this.notificationService.success('Inventory level updated successfully.');
        this.loadData();
      },
      error: (err) => {
        this.savingAdjustment = false;
        this.notificationService.error(err.error?.message || 'Failed to update stock');
      }
    });
  }

  openNewStockModal() {
    this.newStockProductId = '';
    this.newStockWarehouseId = '';
    this.newStockQuantity = 50;
    this.showNewStockModal = true;
  }

  createInitialStock() {
    if (!this.newStockProductId || !this.newStockWarehouseId) return;
    this.savingNewStock = true;

    const prod = this.products.find(p => p.productId === Number(this.newStockProductId));
    const wh = this.warehouses.find(w => w.warehouseId === Number(this.newStockWarehouseId));

    if (!prod || !wh) {
      this.savingNewStock = false;
      return;
    }

    const payload: Inventory = {
      product: prod,
      warehouse: wh,
      quantity: this.newStockQuantity,
      reservedQuantity: 0
    };

    this.inventoryService.create(payload).subscribe({
      next: () => {
        this.savingNewStock = false;
        this.showNewStockModal = false;
        this.notificationService.success(`Initial stock of ${this.newStockQuantity} assigned for ${prod.productName}.`);
        this.loadData();
      },
      error: (err) => {
        this.savingNewStock = false;
        this.notificationService.error(err.error?.message || 'Failed to assign inventory');
      }
    });
  }
}
