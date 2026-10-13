import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { CategoryService } from '../../../core/services/category.service';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard Overview</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">Total Products</div>
          <div class="stat-value">{{ productCount }}</div>
          <div class="stat-icon bg-blue">📦</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Categories</div>
          <div class="stat-value">{{ categoryCount }}</div>
          <div class="stat-icon bg-green">🏷️</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Warehouses</div>
          <div class="stat-value">{{ warehouseCount }}</div>
          <div class="stat-icon bg-purple">🏢</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Total Inventory Types</div>
          <div class="stat-value">{{ inventoryCount }}</div>
          <div class="stat-icon bg-orange">📊</div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="card recent-activity">
          <div class="card-header">
            <h2 class="card-title">Recent Products</h2>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of recentProducts">
                  <td>{{ p.productName }}</td>
                  <td>{{ p.sku }}</td>
                  <td>\${{ p.price }}</td>
                  <td><span class="badge" [ngClass]="p.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">{{ p.status }}</span></td>
                </tr>
                <tr *ngIf="recentProducts.length === 0">
                  <td colspan="4" class="text-center text-muted">No products found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: var(--surface-color);
      border-radius: 12px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .stat-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .stat-icon {
      position: absolute;
      right: 1.5rem;
      top: 1.5rem;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .bg-blue { background-color: #e0f2fe; }
    .bg-green { background-color: #dcfce7; }
    .bg-purple { background-color: #f3e8ff; }
    .bg-orange { background-color: #ffedd5; }
    .text-center { text-align: center; }
    .text-muted { color: var(--text-secondary); }
  `]
})
export class DashboardComponent implements OnInit {
  productCount = 0;
  categoryCount = 0;
  warehouseCount = 0;
  inventoryCount = 0;
  recentProducts: any[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private warehouseService: WarehouseService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.productService.getAll().subscribe(data => {
      this.productCount = data.length;
      this.recentProducts = data.slice(0, 5);
    });
    this.categoryService.getAll().subscribe(data => this.categoryCount = data.length);
    this.warehouseService.getAll().subscribe(data => this.warehouseCount = data.length);
    this.inventoryService.getAll().subscribe(data => this.inventoryCount = data.length);
  }
}
