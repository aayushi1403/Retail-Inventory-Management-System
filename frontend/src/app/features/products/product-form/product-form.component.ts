import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="header-actions">
      <h1>{{ isEditMode ? 'Edit Product' : 'Add Product' }}</h1>
      <a routerLink="/products" class="btn btn-secondary">Back to List</a>
    </div>

    <div class="card">
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label">Product Name</label>
          <input type="text" class="form-control" formControlName="productName">
        </div>

        <div class="form-group">
          <label class="form-label">SKU</label>
          <input type="text" class="form-control" formControlName="sku">
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" formControlName="category" [compareWith]="compareCategory">
            <option [ngValue]="null">Select Category</option>
            <option *ngFor="let cat of categories" [ngValue]="cat">
              {{ cat.categoryName }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Price</label>
          <input type="number" class="form-control" formControlName="price" min="0" step="0.01">
        </div>

        <div class="form-group">
          <label class="form-label">Reorder Level</label>
          <input type="number" class="form-control" formControlName="reorderLevel" min="0">
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" formControlName="status">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || submitting">
          {{ submitting ? 'Saving...' : 'Save Product' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  isEditMode = false;
  productId?: number;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  initForm() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      sku: ['', Validators.required],
      category: [null, Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [10, [Validators.min(0)]],
      status: ['ACTIVE']
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(data => this.categories = data);
  }

  loadProduct(id: number) {
    this.productService.getById(id).subscribe(data => {
      // Need to find the exact category reference to match the select dropdown
      const selectedCategory = this.categories.find(c => c.categoryId === data.category.categoryId) || data.category;
      this.productForm.patchValue({
        ...data,
        category: selectedCategory
      });
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    
    this.submitting = true;
    const data = this.productForm.value;

    const request$ = this.isEditMode
      ? this.productService.update(this.productId!, data)
      : this.productService.create(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error(err);
        alert('Failed to save product');
        this.submitting = false;
      }
    });
  }

  compareCategory(c1: Category, c2: Category): boolean {
    return c1 && c2 ? c1.categoryId === c2.categoryId : c1 === c2;
  }
}
