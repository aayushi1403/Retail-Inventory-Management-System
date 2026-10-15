import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StockTransferService } from '../../../core/services/stock-transfer.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StockTransfer } from '../../../core/models/models';

@Component({
  selector: 'app-stock-transfer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="page-title-group">
          <h1>Stock Transfers</h1>
          <p class="page-subtitle">Inter-warehouse inventory relocation and balanced stock redistribution</p>
        </div>

        <div class="page-actions" *ngIf="canInitiateTransfer()">
          <a routerLink="/stock-transfers/new" class="rf-btn rf-btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
            <span>Initiate Transfer</span>
          </a>
        </div>
      </div>

      <!-- Filters & Status Toolbar -->
      <div class="rf-toolbar">
        <div class="rf-search-box">
          <svg class="rf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="applyFilters()" 
            placeholder="Search transfer #, product, or warehouse..." 
            class="rf-input"
          />
        </div>

        <div class="rf-filter-group">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="rf-select" style="min-width: 170px;">
            <option value="ALL">All Transfer Statuses</option>
            <option value="PENDING">PENDING (Awaiting Completion)</option>
            <option value="COMPLETED">COMPLETED (Transferred)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <!-- Transfers Table -->
      <div class="rf-table-container" *ngIf="!loading">
        <table class="rf-table">
          <thead>
            <tr>
              <th>Transfer ID</th>
              <th>Product SKU & Details</th>
              <th>Origin Facility</th>
              <th>Destination Facility</th>
              <th class="text-right">Quantity</th>
              <th>Initiated Date</th>
              <th>Status</th>
              <th class="text-right" *ngIf="canApproveTransfer()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of filteredTransfers">
              <td>
                <span class="font-mono font-bold text-main">#TRF-{{ t.transferId }}</span>
              </td>
              <td>
                <div class="font-semibold text-main">{{ t.product.productName }}</div>
                <div class="font-mono text-muted" style="font-size: 0.75rem;">{{ t.product.sku }}</div>
              </td>
              <td>
                <span class="warehouse-tag">{{ t.sourceWarehouse.warehouseName }}</span>
              </td>
              <td>
                <span class="warehouse-tag" style="background: #eef2ff; border-color: #c7d2fe; color: #4338ca;">
                  {{ t.destinationWarehouse.warehouseName }}
                </span>
              </td>
              <td class="text-right font-bold text-main">
                {{ t.quantity }} units
              </td>
              <td class="text-muted font-mono" style="font-size: 0.8125rem;">
                {{ formatDateTime(t.transferDate) }}
              </td>
              <td>
                <span class="rf-badge" [ngClass]="getBadgeClass(t.status)">
                  {{ t.status }}
                </span>
              </td>
              <td class="text-right" *ngIf="canApproveTransfer()">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    *ngIf="t.status === 'PENDING'" 
                    (click)="completeTransfer(t)" 
                    class="rf-btn rf-btn-primary rf-btn-sm"
                    title="Execute transfer and move stock between warehouses"
                  >
                    Complete & Relocate
                  </button>
                  <button 
                    *ngIf="t.status === 'PENDING'" 
                    (click)="cancelTransfer(t)" 
                    class="rf-btn rf-btn-ghost rf-btn-sm text-danger"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="filteredTransfers.length === 0" class="rf-empty-state">
          <div class="rf-empty-icon">🔄</div>
          <div class="rf-empty-title">No stock transfers found</div>
          <div class="rf-empty-description">Relocate inventory between regional warehouses to optimize fulfillment.</div>
          <a *ngIf="canInitiateTransfer()" routerLink="/stock-transfers/new" class="rf-btn rf-btn-primary rf-btn-sm">
            Create Stock Transfer
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="rf-table-container" style="padding: 1.5rem;">
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px; margin-bottom: 0.75rem;"></div>
        <div class="rf-skeleton" style="height: 48px;"></div>
      </div>
    </div>
  `,
  styles: [`
    .warehouse-tag {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #334155;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }
    .text-danger { color: #dc2626; }
  `]
})
export class StockTransferListComponent implements OnInit {
  transfers: StockTransfer[] = [];
  filteredTransfers: StockTransfer[] = [];
  searchQuery = '';
  statusFilter = 'ALL';
  loading = true;

  constructor(
    private transferService: StockTransferService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadTransfers();
  }

  loadTransfers() {
    this.loading = true;
    this.transferService.getAll().subscribe({
      next: (data) => {
        this.transfers = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to load stock transfers');
      }
    });
  }

  applyFilters() {
    let result = [...this.transfers];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        t => (`#trf-${t.transferId}`.includes(q)) ||
             (t.product?.productName && t.product.productName.toLowerCase().includes(q)) ||
             (t.sourceWarehouse?.warehouseName && t.sourceWarehouse.warehouseName.toLowerCase().includes(q)) ||
             (t.destinationWarehouse?.warehouseName && t.destinationWarehouse.warehouseName.toLowerCase().includes(q))
      );
    }

    if (this.statusFilter !== 'ALL') {
      result = result.filter(t => t.status === this.statusFilter);
    }

    this.filteredTransfers = result;
  }

  formatDateTime(isoDate?: string): string {
    if (!isoDate) return '—';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoDate;
    }
  }

  getBadgeClass(status?: string): string {
    switch (status) {
      case 'COMPLETED': return 'rf-badge-success';
      case 'PENDING': return 'rf-badge-warning';
      case 'CANCELLED': return 'rf-badge-danger';
      default: return 'rf-badge-neutral';
    }
  }

  canInitiateTransfer(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('manager');
  }

  canApproveTransfer(): boolean {
    const role = this.authService.getActiveRoleName();
    return role.includes('admin') || role.includes('manager');
  }

  completeTransfer(transfer: StockTransfer) {
    if (!transfer.transferId) return;
    const updated = { ...transfer, status: 'COMPLETED' };
    this.transferService.update(transfer.transferId, updated).subscribe({
      next: () => {
        this.notificationService.success(`Transfer #TRF-${transfer.transferId} completed. Stock moved from ${transfer.sourceWarehouse?.warehouseName} to ${transfer.destinationWarehouse?.warehouseName}.`);
        this.loadTransfers();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to complete stock transfer');
      }
    });
  }

  cancelTransfer(transfer: StockTransfer) {
    if (!transfer.transferId) return;
    const updated = { ...transfer, status: 'CANCELLED' };
    this.transferService.update(transfer.transferId, updated).subscribe({
      next: () => {
        this.notificationService.info(`Transfer #TRF-${transfer.transferId} cancelled.`);
        this.loadTransfers();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to cancel stock transfer');
      }
    });
  }
}
