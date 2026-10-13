import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { Warehouse } from '../../../core/models/models';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-actions">
      <h1>Warehouses</h1>
      <a routerLink="/warehouses/new" class="btn btn-primary">+ Add Warehouse</a>
    </div>

    <div class="card">
      <div *ngIf="loading" class="loading-state">Loading warehouses...</div>
      <div *ngIf="error" class="error-state">{{ error }}</div>

      <div class="table-responsive" *ngIf="!loading && !error">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let w of warehouses">
              <td>{{ w.warehouseId }}</td>
              <td>{{ w.warehouseName }}</td>
              <td>{{ w.location }}</td>
              <td>{{ w.managerName }}</td>
              <td>
                <span class="badge" [ngClass]="w.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
                  {{ w.status }}
                </span>
              </td>
              <td>
                <div class="actions flex gap-2">
                  <a [routerLink]="['/warehouses/edit', w.warehouseId]" class="btn btn-secondary">Edit</a>
                  <button (click)="deleteWarehouse(w.warehouseId!)" class="btn btn-danger">Delete</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="warehouses.length === 0">
              <td colspan="6" class="text-center text-muted">No warehouses found.</td>
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
export class WarehouseListComponent implements OnInit {
  warehouses: Warehouse[] = [];
  loading = true;
  error = '';

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (data) => {
        this.warehouses = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load warehouses.';
        this.loading = false;
      }
    });
  }

  deleteWarehouse(id: number) {
    if (confirm('Delete warehouse?')) {
      this.warehouseService.delete(id).subscribe({
        next: () => this.loadWarehouses(),
        error: () => alert('Failed to delete warehouse.')
      });
    }
  }
}
