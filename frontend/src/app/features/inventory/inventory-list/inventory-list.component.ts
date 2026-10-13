import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { Inventory } from '../../../core/models/models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-actions">
      <h1>Stock Levels</h1>
    </div>

    <div class="card">
      <div *ngIf="loading" class="loading-state">Loading inventory...</div>
      <div *ngIf="error" class="error-state">{{ error }}</div>

      <div class="table-responsive" *ngIf="!loading && !error">
        <table class="table">
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of inventoryItems">
              <td>{{ item.warehouse?.warehouseName }}</td>
              <td>{{ item.product?.productName }}</td>
              <td>{{ item.product?.sku }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.reservedQuantity }}</td>
              <td>{{ item.quantity - item.reservedQuantity }}</td>
              <td>
                <span class="badge" [ngClass]="getBadgeClass(item)">
                  {{ getStockStatus(item) }}
                </span>
              </td>
              <td>{{ item.lastUpdated | date:'medium' }}</td>
            </tr>
            <tr *ngIf="inventoryItems.length === 0">
              <td colspan="8" class="text-center text-muted">No inventory records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; justify-content: space-between; align-items: center; }
    .loading-state, .error-state, .text-center { padding: 2rem; text-align: center; }
    .error-state { color: var(--danger-color); }
  `]
})
export class InventoryListComponent implements OnInit {
  inventoryItems: Inventory[] = [];
  loading = true;
  error = '';

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.inventoryItems = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load inventory.';
        this.loading = false;
      }
    });
  }

  getStockStatus(item: Inventory): string {
    const available = item.quantity - item.reservedQuantity;
    if (available <= 0) return 'Out of Stock';
    if (item.product?.reorderLevel && available <= item.product.reorderLevel) return 'Low Stock';
    return 'In Stock';
  }

  getBadgeClass(item: Inventory): string {
    const status = this.getStockStatus(item);
    if (status === 'Out of Stock') return 'badge-danger';
    if (status === 'Low Stock') return 'badge-warning';
    return 'badge-success';
  }
}
