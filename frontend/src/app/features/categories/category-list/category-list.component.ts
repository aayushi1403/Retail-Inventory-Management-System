import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/models';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-actions">
      <h1>Categories</h1>
      <a routerLink="/categories/new" class="btn btn-primary">+ Add Category</a>
    </div>

    <div class="card">
      <div *ngIf="loading" class="loading-state">Loading categories...</div>
      <div *ngIf="error" class="error-state">{{ error }}</div>

      <div class="table-responsive" *ngIf="!loading && !error">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of categories">
              <td>{{ cat.categoryId }}</td>
              <td>{{ cat.categoryName }}</td>
              <td>{{ cat.description }}</td>
              <td>
                <span class="badge" [ngClass]="cat.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                  {{ cat.status }}
                </span>
              </td>
              <td>
                <div class="actions flex gap-2">
                  <a [routerLink]="['/categories/edit', cat.categoryId]" class="btn btn-secondary">Edit</a>
                  <button (click)="deleteCategory(cat.categoryId!)" class="btn btn-danger">Delete</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="categories.length === 0">
              <td colspan="5" class="text-center text-muted">No categories found.</td>
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
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load categories.';
        this.loading = false;
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Delete this category?')) {
      this.categoryService.delete(id).subscribe({
        next: () => this.loadCategories(),
        error: () => alert('Failed to delete category.')
      });
    }
  }
}
