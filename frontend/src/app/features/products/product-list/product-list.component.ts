import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product, Category, Inventory } from '../../../core/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1>Product Catalog</h1>
          <p class="page-subtitle">Centralized SKU management, pricing, and category classifications</p>
        </div>

        <div class="page-actions" *ngIf="canManageProducts()">
          <a routerLink="/products/new" class="rf-btn rf-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Product</span>
          </a>
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
            placeholder="Search by product name or SKU..." 
            class="rf-input"
          />
        </div>

        <div class="rf-filter-group">
          <select [(ngModel)]="selectedCategory" (change)="applyFilters()" class="rf-select" style="min-width: 170px;">
            <option value="">All Categories</option>
            <option *ngFor="let cat of categories" [value]="cat.categoryId">{{ cat.categoryName }}</option>
          </select>

          <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="rf-select" style="min-width: 130px;">
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="rf-select" style="min-width: 150px;">
            <option value="name">Sort: Name (A-Z)</option>
            <option value="price-asc">Sort: Price (Low → High)</option>
            <option value="price-desc">Sort: Price (High → Low)</option>
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Details</th>
              <th>Category</th>
              <th class="text-right">Unit Price</th>
              <th class="text-center">Total Stock</th>
              <th>Status</th>
              <th class="text-right" *ngIf="canManageProducts()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of filteredProducts">
              <td>
                <span class="font-mono font-bold">{{ product.sku }}</span>
              </td>
              <td>
                <div class="font-semibold text-main">{{ product.productName }}</div>
                <div class="text-muted" style="font-size: 0.75rem;">{{ product.description || 'No description provided' }}</div>
              </td>
              <td>
                <span class="category-tag">{{ product.category?.categoryName || 'Unassigned' }}</span>
              </td>
              <td class="text-right font-bold text-main">
                \${{ product.price | number:'1.2-2' }}
              </td>
              <td class="text-center">
                <button 
                  type="button" 
                  class="stock-badge-btn" 
                  (click)="viewProductStock(product)"
                  title="Click to view warehouse distribution"
                >
                  <span class="stock-num">{{ getStockTotal(product.productId) }}</span>
                  <span class="stock-sub">units</span>
                </button>
              </td>
              <td>
                <span class="rf-badge" [ngClass]="product.status === 'ACTIVE' ? 'rf-badge-success' : 'rf-badge-neutral'">
                  {{ product.status }}
                </span>
              </td>
              <td class="text-right" *ngIf="canManageProducts()">
                <div class="flex items-center justify-end gap-2">
                  <a [routerLink]="['/products/edit', product.productId]" class="rf-btn rf-btn-secondary rf-btn-sm">
                    Edit
                  </a>
                  <button (click)="confirmDelete(product)" class="rf-btn rf-btn-danger rf-btn-sm" *ngIf="isAdmin()">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredProducts.length === 0" class="rf-empty-state">
          <div class="rf-empty-icon">📦</div>
          <div class="rf-empty-title">No products found</div>
          <div class="rf-empty-description">Try adjusting your search query or filter parameters.</div>
          <a *ngIf="canManageProducts()" routerLink="/products/new" class="rf-btn rf-btn-primary rf-btn-sm">
            Add New Product
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>

      <!-- Warehouse Stock Breakdown Modal -->
      <div class="rf-modal-backdrop" *ngIf="selectedProductForStock">
        <div class="rf-modal">
          <div class="rf-modal-header">
            <div>
              <div class="rf-modal-title">{{ selectedProductForStock.productName }}</div>
              <div class="text-muted font-mono" style="font-size: 0.8125rem;">SKU: {{ selectedProductForStock.sku }}</div>
            </div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="selectedProductForStock = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <h3 style="font-size: 0.875rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">
              Warehouse Distribution & Availability
            </h3>
            <table class="rf-table" *ngIf="activeProductInventories.length > 0">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th class="text-right">On Hand</th>
                  <th class="text-right">Reserved</th>
                  <th class="text-right">Available</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let inv of activeProductInventories">
                  <td class="font-semibold">{{ inv.warehouse.warehouseName }}</td>
                  <td class="text-right font-bold">{{ inv.quantity }}</td>
                  <td class="text-right text-muted">{{ inv.reservedQuantity }}</td>
                  <td class="text-right font-bold text-success">{{ inv.quantity - inv.reservedQuantity }}</td>
                </tr>
              </tbody>
            </table>
            <div *ngIf="activeProductInventories.length === 0" class="rf-empty-state" style="padding: 2rem 1rem;">
              <div class="rf-empty-title">No warehouse stock assigned</div>
              <div class="rf-empty-description">Create an initial stock record or purchase order to stock this SKU.</div>
            </div>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="selectedProductForStock = null">Close</button>
            <a *ngIf="canManageProducts()" [routerLink]="['/products/edit', selectedProductForStock.productId]" class="rf-btn rf-btn-primary" (click)="selectedProductForStock = null">
              Edit Product
            </a>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="rf-modal-backdrop" *ngIf="productToDelete">
        <div class="rf-modal" style="max-width: 440px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">Delete Product</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="productToDelete = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
              Are you sure you want to permanently delete <strong>{{ productToDelete.productName }}</strong> (SKU: {{ productToDelete.sku }})? This action cannot be undone.
            </p>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="productToDelete = null">Cancel</button>
            <button class="rf-btn rf-btn-danger" (click)="deleteConfirmed()">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-tag {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }

    .stock-badge-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 3px 8px;
      transition: all 0.15s ease;
    }
    .stock-badge-btn:hover {
      background: #eef2ff;
      border-color: #c7d2fe;
    }

    .stock-num {
      font-weight: 700;
      font-size: 0.8125rem;
      color: var(--text-main);
    }

    .stock-sub {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    .text-success { color: #059669; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  inventories: Inventory[] = [];

  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  sortBy = 'name';

  loading = true;
  selectedProductForStock: Product | null = null;
  activeProductInventories: Inventory[] = [];
  productToDelete: Product | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private inventoryService: InventoryService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
    });

    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      products: this.productService.getAll(),
      categories: this.categoryService.getAll(),
      inventories: this.inventoryService.getAll()
    }).subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.categories = res.categories || [];
        this.inventories = res.inventories || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load products');
      }
    });
  }

  applyFilters() {
    let result = [...this.products];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.productName.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }

    if (this.selectedCategory) {
      result = result.filter(
        p => p.category?.categoryId === Number(this.selectedCategory)
      );
    }

    if (this.selectedStatus) {
      result = result.filter(p => p.status === this.selectedStatus);
    }

    if (this.sortBy === 'name') {
      result.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (this.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    this.filteredProducts = result;
  }

  getStockTotal(productId?: number): number {
    if (!productId) return 0;
    return this.inventories
      .filter(i => i.product?.productId === productId)
      .reduce((sum, i) => sum + (i.quantity || 0), 0);
  }

  viewProductStock(product: Product) {
    this.selectedProductForStock = product;
    this.activeProductInventories = this.inventories.filter(
      i => i.product?.productId === product.productId
    );
  }

  canManageProducts(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('manager') || role.includes('procure');
  }

  isAdmin(): boolean {
    return this.authService.getActiveRoleName().includes('admin');
  }

  confirmDelete(product: Product) {
    this.productToDelete = product;
  }

  deleteConfirmed() {
    if (!this.productToDelete?.productId) return;
    const id = this.productToDelete.productId;
    this.productService.delete(id).subscribe({
      next: () => {
        this.notificationService.success(`Product "${this.productToDelete?.productName}" deleted successfully.`);
        this.productToDelete = null;
        this.loadData();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to delete product.');
        this.productToDelete = null;
      }
    });
  }
}
