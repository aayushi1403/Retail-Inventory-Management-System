import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Category, Product } from '../../../core/models/models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Categories</h1>
          <p class="page-subtitle">Organize product taxonomies and merchandising groups</p>
        </div>
        <button (click)="openAddModal()" class="rf-btn rf-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Category</span>
        </button>
      </div>

      <!-- Categories Table -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Description</th>
              <th class="text-center">Assigned Products</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of categories">
              <td class="font-bold text-main">{{ cat.categoryName }}</td>
              <td class="text-muted">{{ cat.description || '—' }}</td>
              <td class="text-center font-bold">
                <span class="product-count-pill">{{ getProductCount(cat.categoryId) }} SKUs</span>
              </td>
              <td>
                <span class="rf-badge" [ngClass]="cat.status === 'ACTIVE' ? 'rf-badge-success' : 'rf-badge-neutral'">
                  {{ cat.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-2">
                  <button (click)="openEditModal(cat)" class="rf-btn rf-btn-secondary rf-btn-sm">
                    Edit
                  </button>
                  <button (click)="confirmDelete(cat)" class="rf-btn rf-btn-danger rf-btn-sm">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="categories.length === 0" class="rf-empty-state">
          <div class="rf-empty-icon">🏷️</div>
          <div class="rf-empty-title">No categories found</div>
          <div class="rf-empty-description">Create categories to organize your product inventory.</div>
          <button (click)="openAddModal()" class="rf-btn rf-btn-primary rf-btn-sm">Add Category</button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>

      <!-- Category Add/Edit Modal -->
      <div class="rf-modal-backdrop" *ngIf="showModal">
        <div class="rf-modal" style="max-width: 480px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">{{ isEdit ? 'Edit Category' : 'Create Category' }}</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="showModal = false">✕</button>
          </div>
          <form (ngSubmit)="saveCategory()" class="rf-modal-body">
            <div class="rf-form-group">
              <label class="rf-label">Category Name *</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="currentCategory.categoryName" 
                name="name" 
                placeholder="e.g. Footwear, Kitchenware..."
                required
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Description</label>
              <textarea 
                rows="3" 
                class="rf-textarea" 
                [(ngModel)]="currentCategory.description" 
                name="desc" 
                placeholder="Short taxonomy summary..."
              ></textarea>
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Status</label>
              <select class="rf-select" [(ngModel)]="currentCategory.status" name="status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div class="rf-modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
              <button type="button" class="rf-btn rf-btn-secondary" (click)="showModal = false">Cancel</button>
              <button type="submit" class="rf-btn rf-btn-primary" [disabled]="saving || !currentCategory.categoryName">
                <span *ngIf="saving">Saving...</span>
                <span *ngIf="!saving">{{ isEdit ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <div class="rf-modal-backdrop" *ngIf="categoryToDelete">
        <div class="rf-modal" style="max-width: 440px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">Delete Category</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="categoryToDelete = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
              Are you sure you want to delete category <strong>{{ categoryToDelete.categoryName }}</strong>?
            </p>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="categoryToDelete = null">Cancel</button>
            <button class="rf-btn rf-btn-danger" (click)="deleteConfirmed()">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-count-pill {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  loading = true;

  showModal = false;
  isEdit = false;
  saving = false;
  currentCategory: Category = { categoryName: '', description: '', status: 'ACTIVE' };
  categoryToDelete: Category | null = null;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      categories: this.categoryService.getAll(),
      products: this.productService.getAll()
    }).subscribe({
      next: (res) => {
        this.categories = res.categories || [];
        this.products = res.products || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load categories');
      }
    });
  }

  getProductCount(catId?: number): number {
    if (!catId) return 0;
    return this.products.filter(p => p.category?.categoryId === catId).length;
  }

  openAddModal() {
    this.isEdit = false;
    this.currentCategory = { categoryName: '', description: '', status: 'ACTIVE' };
    this.showModal = true;
  }

  openEditModal(cat: Category) {
    this.isEdit = true;
    this.currentCategory = { ...cat };
    this.showModal = true;
  }

  saveCategory() {
    if (!this.currentCategory.categoryName) return;
    this.saving = true;

    if (this.isEdit && this.currentCategory.categoryId) {
      this.categoryService.update(this.currentCategory.categoryId, this.currentCategory).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.notificationService.success(`Category "${this.currentCategory.categoryName}" updated.`);
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to update category');
        }
      });
    } else {
      this.categoryService.create(this.currentCategory).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.notificationService.success(`Category "${this.currentCategory.categoryName}" created.`);
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to create category');
        }
      });
    }
  }

  confirmDelete(cat: Category) {
    this.categoryToDelete = cat;
  }

  deleteConfirmed() {
    if (!this.categoryToDelete?.categoryId) return;
    this.categoryService.delete(this.categoryToDelete.categoryId).subscribe({
      next: () => {
        this.notificationService.success(`Category "${this.categoryToDelete?.categoryName}" removed.`);
        this.categoryToDelete = null;
        this.loadData();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to delete category');
        this.categoryToDelete = null;
      }
    });
  }
}
