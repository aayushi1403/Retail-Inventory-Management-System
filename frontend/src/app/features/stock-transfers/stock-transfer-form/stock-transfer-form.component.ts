import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { StockTransferService } from '../../../core/services/stock-transfer.service';
import { ProductService } from '../../../core/services/product.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product, Warehouse, Inventory, StockTransfer } from '../../../core/models/models';

@Component({
  selector: 'app-stock-transfer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width: 800px; margin: 0 auto;">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Initiate Stock Transfer</h1>
          <p class="page-subtitle">Schedule inventory relocation between regional fulfillment facilities</p>
        </div>
        <a routerLink="/stock-transfers" class="rf-btn rf-btn-secondary rf-btn-sm">
          ← Back to Transfers
        </a>
      </div>

      <div class="rf-card">
        <form (ngSubmit)="onSubmit()" class="rf-card-body">
          <div class="form-grid">
            <!-- Product Selection -->
            <div class="rf-form-group" style="grid-column: 1 / -1;">
              <label class="rf-label">Select Product SKU to Transfer *</label>
              <select 
                class="rf-select" 
                [(ngModel)]="selectedProductId" 
                name="prod"
                (change)="onProductOrWarehouseChanged()"
                required
              >
                <option value="">Select product</option>
                <option *ngFor="let p of products" [value]="p.productId">
                  {{ p.productName }} ({{ p.sku }}) — \${{ p.price }}
                </option>
              </select>
            </div>

            <!-- Origin Warehouse -->
            <div class="rf-form-group">
              <label class="rf-label">Origin Facility (Source) *</label>
              <select 
                class="rf-select" 
                [(ngModel)]="sourceWarehouseId" 
                name="src"
                (change)="onProductOrWarehouseChanged()"
                required
              >
                <option value="">Select origin facility</option>
                <option *ngFor="let wh of warehouses" [value]="wh.warehouseId">
                  {{ wh.warehouseName }} ({{ wh.location }})
                </option>
              </select>
              <div *ngIf="sourceInventory" class="stock-check-hint text-success">
                Available at source: <strong>{{ sourceInventory.quantity - sourceInventory.reservedQuantity }}</strong> units
              </div>
              <div *ngIf="!sourceInventory && selectedProductId && sourceWarehouseId" class="stock-check-hint text-danger">
                No active stock recorded at this warehouse!
              </div>
            </div>

            <!-- Destination Warehouse -->
            <div class="rf-form-group">
              <label class="rf-label">Destination Facility (Target) *</label>
              <select 
                class="rf-select" 
                [(ngModel)]="destinationWarehouseId" 
                name="dest"
                (change)="validateWarehouses()"
                required
              >
                <option value="">Select destination facility</option>
                <option *ngFor="let wh of warehouses" [value]="wh.warehouseId">
                  {{ wh.warehouseName }} ({{ wh.location }})
                </option>
              </select>
              <div *ngIf="sameWarehouseError" class="stock-check-hint text-danger">
                Origin and destination facilities cannot be identical.
              </div>
            </div>

            <!-- Transfer Quantity -->
            <div class="rf-form-group">
              <label class="rf-label">Quantity to Transfer *</label>
              <input 
                type="number" 
                min="1" 
                class="rf-input" 
                [(ngModel)]="quantity" 
                name="qty"
                placeholder="10"
                required
              />
              <span class="rf-form-hint">Must not exceed available units at origin facility</span>
            </div>

            <!-- Status Choice -->
            <div class="rf-form-group">
              <label class="rf-label">Initial Status</label>
              <select class="rf-select" [(ngModel)]="initialStatus" name="status">
                <option value="PENDING">PENDING (Awaiting Reception)</option>
                <option value="COMPLETED">COMPLETED (Immediate Transfer)</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/stock-transfers" class="rf-btn rf-btn-secondary">Cancel</a>
            <button 
              type="submit" 
              class="rf-btn rf-btn-primary" 
              [disabled]="saving || !isValid()"
            >
              <span *ngIf="saving">Initiating Relocation...</span>
              <span *ngIf="!saving">Confirm Stock Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .stock-check-hint {
      font-size: 0.75rem;
      margin-top: 0.375rem;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }

    .text-danger { color: #dc2626; }
    .text-success { color: #059669; }
  `]
})
export class StockTransferFormComponent implements OnInit {
  products: Product[] = [];
  warehouses: Warehouse[] = [];

  selectedProductId: any = '';
  sourceWarehouseId: any = '';
  destinationWarehouseId: any = '';
  quantity = 10;
  initialStatus = 'PENDING';

  sourceInventory: Inventory | null = null;
  sameWarehouseError = false;
  saving = false;

  constructor(
    private transferService: StockTransferService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private inventoryService: InventoryService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    forkJoin({
      products: this.productService.getAll(),
      warehouses: this.warehouseService.getAll()
    }).subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.warehouses = res.warehouses || [];

        if (this.warehouses.length >= 2) {
          this.sourceWarehouseId = this.warehouses[0].warehouseId;
          this.destinationWarehouseId = this.warehouses[1].warehouseId;
        }
      }
    });
  }

  validateWarehouses() {
    this.sameWarehouseError = (
      !!this.sourceWarehouseId && 
      !!this.destinationWarehouseId && 
      this.sourceWarehouseId === this.destinationWarehouseId
    );
  }

  onProductOrWarehouseChanged() {
    this.validateWarehouses();

    if (this.selectedProductId && this.sourceWarehouseId) {
      this.inventoryService.getAll().subscribe({
        next: (allInv) => {
          this.sourceInventory = allInv.find(
            i => i.product?.productId === Number(this.selectedProductId) &&
                 i.warehouse?.warehouseId === Number(this.sourceWarehouseId)
          ) || null;
        }
      });
    } else {
      this.sourceInventory = null;
    }
  }

  isValid(): boolean {
    if (!this.selectedProductId || !this.sourceWarehouseId || !this.destinationWarehouseId) return false;
    if (this.sourceWarehouseId === this.destinationWarehouseId) return false;
    if (!this.quantity || this.quantity <= 0) return false;
    return true;
  }

  onSubmit() {
    if (!this.isValid()) return;
    this.saving = true;

    const prod = this.products.find(p => p.productId === Number(this.selectedProductId));
    const srcWh = this.warehouses.find(w => w.warehouseId === Number(this.sourceWarehouseId));
    const destWh = this.warehouses.find(w => w.warehouseId === Number(this.destinationWarehouseId));

    if (!prod || !srcWh || !destWh) {
      this.saving = false;
      return;
    }

    const payload: StockTransfer = {
      product: prod,
      sourceWarehouse: srcWh,
      destinationWarehouse: destWh,
      quantity: this.quantity,
      status: this.initialStatus,
      createdBy: this.authService.currentUser || undefined
    };

    this.transferService.create(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.notificationService.success(`Stock Transfer of ${this.quantity} units scheduled.`);
        this.router.navigate(['/stock-transfers']);
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.error(err.error?.message || 'Failed to initiate transfer');
      }
    });
  }
}
