import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-actions">
      <h1>Products</h1>
      <a routerLink="/products/new" class="btn btn-primary">+ Add Product</a>
    </div>

    <div class="card">
      <div *ngIf="loading" class="loading-state">Loading products...</div>
      <div *ngIf="error" class="error-state">{{ error }}</div>

      <div class="table-responsive" *ngIf="!loading && !error">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products">
              <td>{{ product.productId }}</td>
              <td>{{ product.productName }}</td>
              <td>{{ product.sku }}</td>
              <td>{{ product.category?.categoryName }}</td>
              <td>\${{ product.price }}</td>
              <td>
                <span class="badge" [ngClass]="product.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                  {{ product.status }}
                </span>
              </td>
              <td>
                <div class="actions flex gap-2">
                  <a [routerLink]="['/products/edit', product.productId]" class="btn btn-secondary">Edit</a>
                  <button (click)="deleteProduct(product.productId!)" class="btn btn-danger">Delete</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="products.length === 0">
              <td colspan="7" class="text-center text-muted">No products found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .loading-state, .error-state, .text-center {
      padding: 2rem;
      text-align: center;
    }
    .error-state { color: var(--danger-color); }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Ensure the backend is running.';
        this.loading = false;
      }
    });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: () => alert('Failed to delete product')
      });
    }
  }
}
