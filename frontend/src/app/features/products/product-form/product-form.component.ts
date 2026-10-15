import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product, Category } from '../../../core/models/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container" style="max-width: 800px; margin: 0 auto;">
      <div class="page-header">
        <div class="page-title-group">
          <h1>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h1>
          <p class="page-subtitle">{{ isEditMode ? 'Update SKU information and pricing attributes' : 'Register a new stock item into the catalog' }}</p>
        </div>
        <a routerLink="/products" class="rf-btn rf-btn-secondary rf-btn-sm">
          ← Back to Catalog
        </a>
      </div>

      <div class="rf-card">
        <form (ngSubmit)="onSubmit()" class="rf-card-body">
          <div class="form-grid">
            <div class="rf-form-group">
              <label class="rf-label">Product Name *</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="product.productName" 
                name="productName" 
                placeholder="e.g. Mechanical Keyboard Pro"
                required
              />
            </div>

            <div class="rf-form-group">
              <label class="rf-label">SKU (Stock Keeping Unit) *</label>
              <input 
                type="text" 
                class="rf-input font-mono" 
                [(ngModel)]="product.sku" 
                name="sku" 
                placeholder="e.g. MK-PRO-01"
                required
              />
              <span class="rf-form-hint">Unique alphanumeric barcode identifier</span>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Category *</label>
              <select 
                class="rf-select" 
                [(ngModel)]="selectedCategoryId" 
                name="category"
                required
              >
                <option value="">Select a category</option>
                <option *ngFor="let cat of categories" [value]="cat.categoryId">
                  {{ cat.categoryName }}
                </option>
              </select>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Unit Price ($) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                class="rf-input" 
                [(ngModel)]="product.price" 
                name="price" 
                placeholder="0.00"
                required
              />
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Reorder Level Threshold</label>
              <input 
                type="number" 
                min="0"
                class="rf-input" 
                [(ngModel)]="product.reorderLevel" 
                name="reorderLevel" 
                placeholder="10"
              />
              <span class="rf-form-hint">Triggers low-stock warning when quantity drops to this value</span>
            </div>

            <div class="rf-form-group">
              <label class="rf-label">Status</label>
              <select class="rf-select" [(ngModel)]="product.status" name="status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div class="rf-form-group" style="margin-top: 0.5rem;">
            <label class="rf-label">Description & Specifications</label>
            <textarea 
              rows="3" 
              class="rf-textarea" 
              [(ngModel)]="product.description" 
              name="description" 
              placeholder="Detailed technical or marketing description..."
            ></textarea>
          </div>

          <div class="form-actions">
            <a routerLink="/products" class="rf-btn rf-btn-secondary">Cancel</a>
            <button 
              type="submit" 
              class="rf-btn rf-btn-primary" 
              [disabled]="saving || !product.productName || !product.sku || !selectedCategoryId || product.price === undefined"
            >
              <span *ngIf="saving">Saving Product...</span>
              <span *ngIf="!saving">{{ isEditMode ? 'Update Product' : 'Create Product' }}</span>
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId?: number;
  categories: Category[] = [];
  selectedCategoryId: any = '';
  saving = false;

  product: Product = {
    productName: '',
    sku: '',
    price: 0,
    reorderLevel: 10,
    status: 'ACTIVE',
    description: ''
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories = cats;
      }
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  loadProduct(id: number) {
    this.productService.getById(id).subscribe({
      next: (prod) => {
        this.product = prod;
        if (prod.category?.categoryId) {
          this.selectedCategoryId = prod.category.categoryId;
        }
      },
      error: () => {
        this.notificationService.error('Failed to load product details');
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit() {
    this.saving = true;
    const cat = this.categories.find(c => c.categoryId === Number(this.selectedCategoryId));
    if (!cat) {
      this.notificationService.error('Please select a valid category.');
      this.saving = false;
      return;
    }

    const payload: Product = {
      ...this.product,
      category: cat
    };

    if (this.isEditMode && this.productId) {
      this.productService.update(this.productId, payload).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.success(`Product "${payload.productName}" updated successfully.`);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to update product');
        }
      });
    } else {
      this.productService.create(payload).subscribe({
        next: () => {
          this.saving = false;
          this.notificationService.success(`Product "${payload.productName}" created successfully.`);
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to create product');
        }
      });
    }
  }
}
