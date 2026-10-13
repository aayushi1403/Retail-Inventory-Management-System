import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="header-actions">
      <h1>{{ isEditMode ? 'Edit Category' : 'Add Category' }}</h1>
      <a routerLink="/categories" class="btn btn-secondary">Back to List</a>
    </div>

    <div class="card">
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label">Category Name</label>
          <input type="text" class="form-control" formControlName="categoryName">
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-control" formControlName="description" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" formControlName="status">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="categoryForm.invalid || submitting">
          {{ submitting ? 'Saving...' : 'Save Category' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  `]
})
export class CategoryFormComponent implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  categoryId?: number;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      description: [''],
      status: ['ACTIVE']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.categoryId = +id;
      this.categoryService.getById(this.categoryId).subscribe(data => {
        this.categoryForm.patchValue(data);
      });
    }
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;
    this.submitting = true;
    const data = this.categoryForm.value;
    const req$ = this.isEditMode
      ? this.categoryService.update(this.categoryId!, data)
      : this.categoryService.create(data);

    req$.subscribe({
      next: () => this.router.navigate(['/categories']),
      error: () => {
        alert('Failed to save category');
        this.submitting = false;
      }
    });
  }
}
