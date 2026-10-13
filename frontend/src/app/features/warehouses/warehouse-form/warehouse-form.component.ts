import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WarehouseService } from '../../../core/services/warehouse.service';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="header-actions">
      <h1>{{ isEditMode ? 'Edit Warehouse' : 'Add Warehouse' }}</h1>
      <a routerLink="/warehouses" class="btn btn-secondary">Back to List</a>
    </div>

    <div class="card">
      <form [formGroup]="warehouseForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label class="form-label">Warehouse Name</label>
          <input type="text" class="form-control" formControlName="warehouseName">
        </div>

        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" class="form-control" formControlName="location">
        </div>

        <div class="form-group">
          <label class="form-label">Manager Name</label>
          <input type="text" class="form-control" formControlName="managerName">
        </div>

        <div class="form-group">
          <label class="form-label">Contact Number</label>
          <input type="text" class="form-control" formControlName="contactNumber">
        </div>

        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" formControlName="status">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="warehouseForm.invalid || submitting">
          {{ submitting ? 'Saving...' : 'Save Warehouse' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  `]
})
export class WarehouseFormComponent implements OnInit {
  warehouseForm!: FormGroup;
  isEditMode = false;
  warehouseId?: number;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private warehouseService: WarehouseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.warehouseForm = this.fb.group({
      warehouseName: ['', Validators.required],
      location: ['', Validators.required],
      managerName: [''],
      contactNumber: [''],
      status: ['ACTIVE']
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.warehouseId = +id;
      this.warehouseService.getById(this.warehouseId).subscribe(data => {
        this.warehouseForm.patchValue(data);
      });
    }
  }

  onSubmit() {
    if (this.warehouseForm.invalid) return;
    this.submitting = true;
    const data = this.warehouseForm.value;
    const req$ = this.isEditMode
      ? this.warehouseService.update(this.warehouseId!, data)
      : this.warehouseService.create(data);

    req$.subscribe({
      next: () => this.router.navigate(['/warehouses']),
      error: () => {
        alert('Failed to save warehouse');
        this.submitting = false;
      }
    });
  }
}
