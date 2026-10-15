import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { PurchaseOrderItemService } from '../../../core/services/purchase-order-item.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Supplier, Warehouse, Product, PurchaseOrder, PurchaseOrderItem } from '../../../core/models/models';

interface OrderLine {
  productId: any;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width: 960px; margin: 0 auto;">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Create Purchase Order</h1>
          <p class="page-subtitle">Configure vendor procurement order with line items and shipment destination</p>
        </div>
        <a routerLink="/purchase-orders" class="rf-btn rf-btn-secondary rf-btn-sm">
          ← Back to Orders
        </a>
      </div>

      <div class="rf-card">
        <form (ngSubmit)="onSubmit()" class="rf-card-body">
          <!-- Order Metadata -->
          <div class="form-grid">
            <div class="rf-form-group">
              <label class="rf-label">Supplier / Vendor *</label>
              <select class="rf-select" [(ngModel)]="selectedSupplierId" name="supplier" required>
                <option value="">Select vendor</option>
                <option *ngFor="let s of suppliers" [value]="s.supplierId">{{ s.supplierName }}</option>
              </select>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Receiving Warehouse *</label>
              <select class="rf-select" [(ngModel)]="selectedWarehouseId" name="warehouse" required>
                <option value="">Select destination warehouse</option>
                <option *ngFor="let wh of warehouses" [value]="wh.warehouseId">{{ wh.warehouseName }} ({{ wh.location }})</option>
              </select>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Order Date *</label>
              <input type="date" class="rf-input font-mono" [(ngModel)]="orderDate" name="od" required />
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Expected Delivery Date</label>
              <input type="date" class="rf-input font-mono" [(ngModel)]="expectedDate" name="ed" />
            </div>
          </div>

          <!-- Dynamic Line Items Section -->
          <div class="line-items-section">
            <div class="line-items-header">
              <h3 style="font-size: 0.9375rem; font-weight: 700; color: var(--text-main);">
                Procurement Line Items
              </h3>
              <button type="button" (click)="addLineItem()" class="rf-btn rf-btn-secondary rf-btn-sm">
                + Add Item Line
              </button>
            </div>

            <div class="table-responsive">
              <table class="rf-table">
                <thead>
                  <tr>
                    <th style="width: 45%;">Product SKU & Name</th>
                    <th style="width: 18%;" class="text-right">Quantity</th>
                    <th style="width: 20%;" class="text-right">Unit Cost ($)</th>
                    <th style="width: 17%;" class="text-right">Subtotal</th>
                    <th style="width: 50px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let line of lines; let i = index">
                    <td>
                      <select 
                        class="rf-select" 
                        [(ngModel)]="line.productId" 
                        [name]="'prod_' + i"
                        (change)="onProductSelected(line)"
                        required
                      >
                        <option value="">Select product to order</option>
                        <option *ngFor="let p of products" [value]="p.productId">
                          {{ p.productName }} ({{ p.sku }}) — \${{ p.price }}
                        </option>
                      </select>
                    </td>
                    <td class="text-right">
                      <input 
                        type="number" 
                        min="1" 
                        class="rf-input text-right" 
                        [(ngModel)]="line.quantity" 
                        [name]="'qty_' + i"
                        (input)="recalculate()"
                        required
                      />
                    </td>
                    <td class="text-right">
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        class="rf-input text-right" 
                        [(ngModel)]="line.unitPrice" 
                        [name]="'price_' + i"
                        (input)="recalculate()"
                        required
                      />
                    </td>
                    <td class="text-right font-bold text-main" style="vertical-align: middle;">
                      \${{ line.subtotal | number:'1.2-2' }}
                    </td>
                    <td class="text-center" style="vertical-align: middle;">
                      <button 
                        type="button" 
                        (click)="removeLineItem(i)" 
                        class="rf-btn rf-btn-ghost rf-btn-sm text-danger"
                        [disabled]="lines.length <= 1"
                        title="Remove line"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Total Valuation Box -->
            <div class="po-total-box">
              <div class="total-label">Total Purchase Order Amount:</div>
              <div class="total-amount">\${{ totalAmount | number:'1.2-2' }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/purchase-orders" class="rf-btn rf-btn-secondary">Cancel</a>
            <button 
              type="submit" 
              class="rf-btn rf-btn-primary" 
              [disabled]="saving || !selectedSupplierId || !selectedWarehouseId || !isValid()"
            >
              <span *ngIf="saving">Transmitting Order...</span>
              <span *ngIf="!saving">Submit Purchase Order</span>
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

    .line-items-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-subtle);
    }

    .line-items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .po-total-box {
      display: flex;
      justify-content: flex-end;
      align-items: baseline;
      gap: 1.25rem;
      margin-top: 1.25rem;
      padding: 1rem 1.25rem;
      background: var(--surface-subtle);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    .total-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .total-amount {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }

    .text-danger { color: #dc2626; }
  `]
})
export class PurchaseOrderFormComponent implements OnInit {
  suppliers: Supplier[] = [];
  warehouses: Warehouse[] = [];
  products: Product[] = [];

  selectedSupplierId: any = '';
  selectedWarehouseId: any = '';
  orderDate = new Date().toISOString().split('T')[0];
  expectedDate = '';

  lines: OrderLine[] = [
    { productId: '', quantity: 10, unitPrice: 0, subtotal: 0 }
  ];

  totalAmount = 0;
  saving = false;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private itemService: PurchaseOrderItemService,
    private supplierService: SupplierService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['supplierId']) {
        this.selectedSupplierId = params['supplierId'];
      }
    });

    forkJoin({
      suppliers: this.supplierService.getAll(),
      warehouses: this.warehouseService.getAll(),
      products: this.productService.getAll()
    }).subscribe({
      next: (res) => {
        this.suppliers = res.suppliers || [];
        this.warehouses = res.warehouses || [];
        this.products = res.products || [];

        if (this.warehouses.length > 0 && !this.selectedWarehouseId) {
          this.selectedWarehouseId = this.warehouses[0].warehouseId;
        }
        if (this.suppliers.length > 0 && !this.selectedSupplierId) {
          this.selectedSupplierId = this.suppliers[0].supplierId;
        }
      }
    });
  }

  addLineItem() {
    this.lines.push({
      productId: '',
      quantity: 10,
      unitPrice: 0,
      subtotal: 0
    });
  }

  removeLineItem(index: number) {
    if (this.lines.length > 1) {
      this.lines.splice(index, 1);
      this.recalculate();
    }
  }

  onProductSelected(line: OrderLine) {
    const prod = this.products.find(p => p.productId === Number(line.productId));
    if (prod) {
      line.unitPrice = prod.price || 0;
      this.recalculate();
    }
  }

  recalculate() {
    let grand = 0;
    for (const line of this.lines) {
      line.subtotal = (line.quantity || 0) * (line.unitPrice || 0);
      grand += line.subtotal;
    }
    this.totalAmount = grand;
  }

  isValid(): boolean {
    return this.lines.length > 0 && this.lines.every(l => !!l.productId && l.quantity > 0 && l.unitPrice >= 0);
  }

  onSubmit() {
    if (!this.isValid()) return;
    this.saving = true;

    const supplier = this.suppliers.find(s => s.supplierId === Number(this.selectedSupplierId));
    const warehouse = this.warehouses.find(w => w.warehouseId === Number(this.selectedWarehouseId));

    if (!supplier || !warehouse) {
      this.saving = false;
      return;
    }

    const orderPayload: PurchaseOrder = {
      supplier,
      warehouse,
      createdBy: this.authService.currentUser || undefined,
      orderDate: this.orderDate,
      expectedDate: this.expectedDate || undefined,
      status: 'PENDING',
      totalAmount: this.totalAmount
    };

    // 1. Create Purchase Order in Spring Boot
    this.purchaseOrderService.create(orderPayload).subscribe({
      next: (createdOrder) => {
        // 2. Create Items for this Purchase Order
        const itemObservables = this.lines.map(line => {
          const product = this.products.find(p => p.productId === Number(line.productId))!;
          const itemPayload: PurchaseOrderItem = {
            purchaseOrder: createdOrder,
            product,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.subtotal
          };
          return this.itemService.create(itemPayload);
        });

        forkJoin(itemObservables).subscribe({
          next: () => {
            this.saving = false;
            this.notificationService.success(`Purchase Order #PO-${createdOrder.purchaseOrderId} created with ${this.lines.length} items.`);
            this.router.navigate(['/purchase-orders']);
          },
          error: () => {
            this.saving = false;
            this.notificationService.warning(`Purchase Order #PO-${createdOrder.purchaseOrderId} created, but error adding line items.`);
            this.router.navigate(['/purchase-orders']);
          }
        });
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.error(err.error?.message || 'Failed to submit purchase order');
      }
    });
  }
}
