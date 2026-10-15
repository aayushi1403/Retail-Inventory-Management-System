import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SupplierService } from '../../../core/services/supplier.service';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Supplier, PurchaseOrder } from '../../../core/models/models';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Suppliers & Vendors</h1>
          <p class="page-subtitle">Vendor directory, procurement agreements, and supplier contacts</p>
        </div>

        <div class="page-actions" *ngIf="canManageSuppliers()">
          <button (click)="openAddModal()" class="rf-btn rf-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      <!-- Suppliers Table -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Address / HQ</th>
              <th class="text-center">Active Orders</th>
              <th>Status</th>
              <th class="text-right" *ngIf="canManageSuppliers()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of suppliers">
              <td class="font-bold text-main">{{ s.supplierName }}</td>
              <td>{{ s.contactPerson || '—' }}</td>
              <td>
                <a *ngIf="s.email" [href]="'mailto:' + s.email" class="email-link">{{ s.email }}</a>
                <span *ngIf="!s.email" class="text-muted">—</span>
              </td>
              <td class="font-mono text-muted">{{ s.phone || '—' }}</td>
              <td class="text-muted" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ s.address || '—' }}
              </td>
              <td class="text-center font-bold">
                <span class="po-badge">{{ getOrderCount(s.supplierId) }} POs</span>
              </td>
              <td>
                <span class="rf-badge" [ngClass]="s.status === 'ACTIVE' ? 'rf-badge-success' : 'rf-badge-neutral'">
                  {{ s.status }}
                </span>
              </td>
              <td class="text-right" *ngIf="canManageSuppliers()">
                <div class="flex items-center justify-end gap-2">
                  <a [routerLink]="['/purchase-orders/new']" [queryParams]="{ supplierId: s.supplierId }" class="rf-btn rf-btn-secondary rf-btn-sm">
                    New PO
                  </a>
                  <button (click)="openEditModal(s)" class="rf-btn rf-btn-secondary rf-btn-sm">
                    Edit
                  </button>
                  <button (click)="confirmDelete(s)" class="rf-btn rf-btn-danger rf-btn-sm" *ngIf="isAdmin()">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="suppliers.length === 0" class="rf-empty-state">
          <div class="rf-empty-icon">🤝</div>
          <div class="rf-empty-title">No suppliers found</div>
          <div class="rf-empty-description">Register wholesale vendors to begin procurement workflows.</div>
          <button (click)="openAddModal()" class="rf-btn rf-btn-primary rf-btn-sm" *ngIf="canManageSuppliers()">
            Add First Supplier
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>

      <!-- Supplier Modal -->
      <div class="rf-modal-backdrop" *ngIf="showModal">
        <div class="rf-modal" style="max-width: 520px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">{{ isEdit ? 'Edit Supplier' : 'Register New Supplier' }}</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="showModal = false">✕</button>
          </div>
          <form (ngSubmit)="saveSupplier()" class="rf-modal-body">
            <div class="rf-form-group">
              <label class="rf-label">Supplier Company Name *</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="currentSupplier.supplierName" 
                name="name" 
                placeholder="e.g. Acme Components Ltd"
                required
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Contact Person</label>
              <input 
                type="text" 
                class="rf-input" 
                [(ngModel)]="currentSupplier.contactPerson" 
                name="cp" 
                placeholder="e.g. Amit Kumar"
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Email Address</label>
              <input 
                type="email" 
                class="rf-input" 
                [(ngModel)]="currentSupplier.email" 
                name="email" 
                placeholder="orders@acme.com"
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Phone Number</label>
              <input 
                type="text" 
                class="rf-input font-mono" 
                [(ngModel)]="currentSupplier.phone" 
                name="phone" 
                placeholder="+91 98765 12345"
              />
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Headquarters / Physical Address</label>
              <textarea 
                rows="2" 
                class="rf-textarea" 
                [(ngModel)]="currentSupplier.address" 
                name="addr" 
                placeholder="Street address, city, state..."
              ></textarea>
            </div>
            <div class="rf-form-group">
              <label class="rf-label">Status</label>
              <select class="rf-select" [(ngModel)]="currentSupplier.status" name="status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div class="rf-modal-footer" style="padding-left: 0; padding-right: 0; margin-bottom: -0.5rem;">
              <button type="button" class="rf-btn rf-btn-secondary" (click)="showModal = false">Cancel</button>
              <button type="submit" class="rf-btn rf-btn-primary" [disabled]="saving || !currentSupplier.supplierName">
                <span *ngIf="saving">Saving...</span>
                <span *ngIf="!saving">{{ isEdit ? 'Update Supplier' : 'Save Supplier' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <div class="rf-modal-backdrop" *ngIf="supplierToDelete">
        <div class="rf-modal" style="max-width: 440px;">
          <div class="rf-modal-header">
            <div class="rf-modal-title">Delete Supplier</div>
            <button class="rf-btn rf-btn-ghost rf-btn-sm" (click)="supplierToDelete = null">✕</button>
          </div>
          <div class="rf-modal-body">
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
              Are you sure you want to delete supplier <strong>{{ supplierToDelete.supplierName }}</strong>?
            </p>
          </div>
          <div class="rf-modal-footer">
            <button class="rf-btn rf-btn-secondary" (click)="supplierToDelete = null">Cancel</button>
            <button class="rf-btn rf-btn-danger" (click)="deleteConfirmed()">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .email-link {
      color: var(--primary);
      text-decoration: underline;
    }
    .po-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: #3b82f6;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
  `]
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  loading = true;

  showModal = false;
  isEdit = false;
  saving = false;
  currentSupplier: Supplier = { supplierName: '', status: 'ACTIVE' };
  supplierToDelete: Supplier | null = null;

  constructor(
    private supplierService: SupplierService,
    private purchaseOrderService: PurchaseOrderService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      suppliers: this.supplierService.getAll(),
      pos: this.purchaseOrderService.getAll()
    }).subscribe({
      next: (res) => {
        this.suppliers = res.suppliers || [];
        this.purchaseOrders = res.pos || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load supplier records');
      }
    });
  }

  getOrderCount(supplierId?: number): number {
    if (!supplierId) return 0;
    return this.purchaseOrders.filter(po => po.supplier?.supplierId === supplierId).length;
  }

  canManageSuppliers(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('procure') || role.includes('manager');
  }

  isAdmin(): boolean {
    return this.authService.getActiveRoleName().includes('admin');
  }

  openAddModal() {
    this.isEdit = false;
    this.currentSupplier = { supplierName: '', status: 'ACTIVE' };
    this.showModal = true;
  }

  openEditModal(s: Supplier) {
    this.isEdit = true;
    this.currentSupplier = { ...s };
    this.showModal = true;
  }

  saveSupplier() {
    if (!this.currentSupplier.supplierName) return;
    this.saving = true;

    if (this.isEdit && this.currentSupplier.supplierId) {
      this.supplierService.update(this.currentSupplier.supplierId, this.currentSupplier).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.notificationService.success(`Supplier "${this.currentSupplier.supplierName}" updated.`);
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to update supplier');
        }
      });
    } else {
      this.supplierService.create(this.currentSupplier).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.notificationService.success(`Supplier "${this.currentSupplier.supplierName}" created.`);
          this.loadData();
        },
        error: (err) => {
          this.saving = false;
          this.notificationService.error(err.error?.message || 'Failed to create supplier');
        }
      });
    }
  }

  confirmDelete(s: Supplier) {
    this.supplierToDelete = s;
  }

  deleteConfirmed() {
    if (!this.supplierToDelete?.supplierId) return;
    this.supplierService.delete(this.supplierToDelete.supplierId).subscribe({
      next: () => {
        this.notificationService.success(`Supplier "${this.supplierToDelete?.supplierName}" removed.`);
        this.supplierToDelete = null;
        this.loadData();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to delete supplier');
        this.supplierToDelete = null;
      }
    });
  }
}
