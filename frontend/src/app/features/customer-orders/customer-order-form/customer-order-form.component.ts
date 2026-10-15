import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerOrderService } from '../../../core/services/customer-order.service';
import { OrderItemService } from '../../../core/services/order-item.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Warehouse, Product, CustomerOrder, OrderItem } from '../../../core/models/models';

interface CustomerLine {
  productId: any;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

@Component({
  selector: 'app-customer-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width: 960px; margin: 0 auto;">
      <div class="page-header">
        <div class="page-title-group">
          <h1>New Customer Sales Order</h1>
          <p class="page-subtitle">Process store orders, customer checkout, and warehouse fulfillment dispatch</p>
        </div>
        <a routerLink="/customer-orders" class="rf-btn rf-btn-secondary rf-btn-sm">
          ← Back to Orders
        </a>
      </div>

      <div class="rf-card">
        <form (ngSubmit)="onSubmit()" class="rf-card-body">
          <!-- Customer & Shipping Information -->
          <h2 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem;">
            Customer & Delivery Information
          </h2>

          <div class="form-grid">
            <div class="rf-form-group">
              <label class="rf-label">Customer Full Name *</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="customerName" 
                name="cname" 
                placeholder="e.g. Priya Nair" 
                required
              />
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Customer Email</label>
              <input 
                type="email" 
                class="rf-input" 
                [(ngModel)]="customerEmail" 
                name="cemail" 
                placeholder="priya.nair@example.com"
              />
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Contact Phone</label>
              <input 
                type="text" 
                class="rf-input font-mono" 
                [(ngModel)]="customerPhone" 
                name="cphone" 
                placeholder="+91 98765 43210"
              />
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Fulfillment Warehouse *</label>
              <select class="rf-select" [(ngModel)]="selectedWarehouseId" name="wh" required>
                <option value="">Select dispatch warehouse</option>
                <option *ngFor="let wh of warehouses" [value]="wh.warehouseId">
                  {{ wh.warehouseName }} ({{ wh.location }})
                </option>
              </select>
            </div>
          </div>

          <div class="rf-form-group" style="margin-top: 0.5rem;">
            <label class="rf-label">Shipping / Delivery Address *</label>
            <textarea 
              rows="2" 
              class="rf-textarea" 
              [(ngModel)]="shippingAddress" 
              name="saddr" 
              placeholder="Full delivery street address, city, state, postal code..."
              required
            ></textarea>
          </div>

          <!-- Line Items Section -->
          <div class="line-items-section">
            <div class="line-items-header">
              <h3 style="font-size: 0.9375rem; font-weight: 700; color: var(--text-main);">
                Order Cart & Products
              </h3>
              <button type="button" (click)="addLineItem()" class="rf-btn rf-btn-secondary rf-btn-sm">
                + Add Product Line
              </button>
            </div>

            <div class="table-responsive">
              <table class="rf-table">
                <thead>
                  <tr>
                    <th style="width: 45%;">Selected Product</th>
                    <th style="width: 18%;" class="text-right">Quantity</th>
                    <th style="width: 20%;" class="text-right">Price ($)</th>
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
                        <option value="">Select product</option>
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

            <!-- Grand Total -->
            <div class="total-box">
              <div class="total-label">Grand Total (Incl. Shipping):</div>
              <div class="total-amount">\${{ totalAmount | number:'1.2-2' }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/customer-orders" class="rf-btn rf-btn-secondary">Cancel</a>
            <button 
              type="submit" 
              class="rf-btn rf-btn-primary" 
              [disabled]="saving || !customerName || !selectedWarehouseId || !isValid()"
            >
              <span *ngIf="saving">Processing Order...</span>
              <span *ngIf="!saving">Place Customer Order</span>
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

    .total-box {
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
export class CustomerOrderFormComponent implements OnInit {
  warehouses: Warehouse[] = [];
  products: Product[] = [];

  customerName = '';
  customerEmail = '';
  customerPhone = '';
  shippingAddress = '';
  selectedWarehouseId: any = '';

  lines: CustomerLine[] = [
    { productId: '', quantity: 1, unitPrice: 0, subtotal: 0 }
  ];

  totalAmount = 0;
  saving = false;

  constructor(
    private orderService: CustomerOrderService,
    private itemService: OrderItemService,
    private warehouseService: WarehouseService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    forkJoin({
      warehouses: this.warehouseService.getAll(),
      products: this.productService.getAll()
    }).subscribe({
      next: (res) => {
        this.warehouses = res.warehouses || [];
        this.products = res.products || [];

        if (this.warehouses.length > 0 && !this.selectedWarehouseId) {
          this.selectedWarehouseId = this.warehouses[0].warehouseId;
        }
      }
    });
  }

  addLineItem() {
    this.lines.push({
      productId: '',
      quantity: 1,
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

  onProductSelected(line: CustomerLine) {
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

    const warehouse = this.warehouses.find(w => w.warehouseId === Number(this.selectedWarehouseId));
    if (!warehouse) {
      this.saving = false;
      return;
    }

    const orderPayload: CustomerOrder = {
      warehouse,
      customerName: this.customerName,
      customerEmail: this.customerEmail || undefined,
      customerPhone: this.customerPhone || undefined,
      shippingAddress: this.shippingAddress,
      status: 'PLACED',
      totalAmount: this.totalAmount
    };

    // 1. Create order
    this.orderService.create(orderPayload).subscribe({
      next: (createdOrder) => {
        // 2. Create line items
        const itemObservables = this.lines.map(line => {
          const product = this.products.find(p => p.productId === Number(line.productId))!;
          const itemPayload: OrderItem = {
            order: createdOrder,
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
            this.notificationService.success(`Order #ORD-${createdOrder.orderId} placed for ${this.customerName}.`);
            this.router.navigate(['/customer-orders']);
          },
          error: () => {
            this.saving = false;
            this.notificationService.warning(`Order created, but error linking line items.`);
            this.router.navigate(['/customer-orders']);
          }
        });
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.error(err.error?.message || 'Failed to place customer order');
      }
    });
  }
}
