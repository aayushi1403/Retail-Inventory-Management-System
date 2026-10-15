import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { CustomerOrderService } from '../../../core/services/customer-order.service';
import { StockTransferService } from '../../../core/services/stock-transfer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { 
  Product, Warehouse, Inventory, Supplier, PurchaseOrder, CustomerOrder, StockTransfer, User 
} from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-title-group">
          <h1>{{ getGreeting() }}, {{ currentUser?.firstName || 'User' }}</h1>
          <p class="page-subtitle">{{ getRoleDashboardSubtitle() }}</p>
        </div>

        <div class="page-actions">
          <div class="live-sync-indicator">
            <span class="pulse-dot"></span>
            <span>MySQL Live Sync Active</span>
          </div>

          <!-- Quick Action based on role -->
          <a *ngIf="isAdmin()" routerLink="/products/new" class="rf-btn rf-btn-primary rf-btn-sm">+ Add Product</a>
          <a *ngIf="isManager()" routerLink="/stock-transfers/new" class="rf-btn rf-btn-primary rf-btn-sm">New Stock Transfer</a>
          <a *ngIf="isRetailer()" routerLink="/customer-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">+ New Customer Order</a>
          <a *ngIf="isProcurement()" routerLink="/purchase-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">+ Create Purchase Order</a>
          <a *ngIf="isCustomer()" routerLink="/customer-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">+ Place New Order</a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="dashboard-skeleton">
        <div class="stats-row">
          <div class="rf-skeleton" style="height: 110px;"></div>
          <div class="rf-skeleton" style="height: 110px;"></div>
          <div class="rf-skeleton" style="height: 110px;"></div>
          <div class="rf-skeleton" style="height: 110px;"></div>
        </div>
        <div class="rf-skeleton" style="height: 340px; margin-top: 1.5rem;"></div>
      </div>

      <div *ngIf="!loading">
        <!-- ============================================== -->
        <!-- 1. ADMIN DASHBOARD VIEW                        -->
        <!-- ============================================== -->
        <ng-container *ngIf="isAdmin()">
          <!-- KPI Metrics Row -->
          <div class="stats-grid">
            <div class="metric-card" routerLink="/products">
              <div class="metric-header">
                <span class="metric-title">TOTAL PRODUCTS</span>
                <div class="metric-icon bg-indigo">📦</div>
              </div>
              <div class="metric-value">{{ products.length }}</div>
              <div class="metric-foot">Catalog SKUs</div>
            </div>

            <div class="metric-card" routerLink="/inventory" [queryParams]="{ filter: 'low-stock' }">
              <div class="metric-header">
                <span class="metric-title">LOW STOCK ALERTS</span>
                <div class="metric-icon bg-rose">⚠️</div>
              </div>
              <div class="metric-value text-danger">{{ lowStockItems.length }}</div>
              <div class="metric-foot text-danger" *ngIf="lowStockItems.length > 0">Needs Reorder</div>
              <div class="metric-foot text-muted" *ngIf="lowStockItems.length === 0">All Levels Optimal</div>
            </div>

            <div class="metric-card" routerLink="/warehouses">
              <div class="metric-header">
                <span class="metric-title">ACTIVE WAREHOUSES</span>
                <div class="metric-icon bg-emerald">🏢</div>
              </div>
              <div class="metric-value">{{ warehouses.length }}</div>
              <div class="metric-foot">Fulfillment Centers</div>
            </div>

            <div class="metric-card" routerLink="/customer-orders">
              <div class="metric-header">
                <span class="metric-title">CUSTOMER ORDERS</span>
                <div class="metric-icon bg-amber">🛍️</div>
              </div>
              <div class="metric-value">{{ customerOrders.length }}</div>
              <div class="metric-foot">Total Processed</div>
            </div>
          </div>

          <!-- Low Stock Action Queue -->
          <div class="dashboard-grid">
            <div class="rf-card">
              <div class="rf-card-header">
                <div class="card-title-wrap">
                  <h2 class="rf-card-title">Low Stock Reorder Exceptions</h2>
                  <span class="badge-count" *ngIf="lowStockItems.length > 0">{{ lowStockItems.length }}</span>
                </div>
                <a routerLink="/inventory" class="rf-btn rf-btn-ghost rf-btn-sm">View Full Stock →</a>
              </div>
              <div class="table-responsive">
                <table class="rf-table" *ngIf="lowStockItems.length > 0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Warehouse</th>
                      <th class="text-right">Available</th>
                      <th class="text-right">Reorder Level</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of lowStockItems">
                      <td class="font-semibold">{{ item.product?.productName }}</td>
                      <td><span class="font-mono text-muted">{{ item.product?.sku }}</span></td>
                      <td>{{ item.warehouse?.warehouseName }}</td>
                      <td class="text-right font-bold text-danger">{{ item.quantity }}</td>
                      <td class="text-right text-muted">{{ item.product?.reorderLevel }}</td>
                      <td>
                        <a [routerLink]="['/purchase-orders/new']" class="rf-btn rf-btn-secondary rf-btn-sm">
                          Order Stock
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div *ngIf="lowStockItems.length === 0" class="rf-empty-state">
                  <div class="rf-empty-icon">✓</div>
                  <div class="rf-empty-title">Stock Levels Healthy</div>
                  <div class="rf-empty-description">All products meet or exceed safety reorder thresholds.</div>
                </div>
              </div>
            </div>

            <!-- Recent Orders & Activity -->
            <div class="rf-card">
              <div class="rf-card-header">
                <h2 class="rf-card-title">Recent Customer Orders</h2>
                <a routerLink="/customer-orders" class="rf-btn rf-btn-ghost rf-btn-sm">All Orders →</a>
              </div>
              <div class="table-responsive">
                <table class="rf-table" *ngIf="customerOrders.length > 0">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th class="text-right">Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let order of customerOrders.slice(0, 5)">
                      <td class="font-mono font-bold">#ORD-{{ order.orderId }}</td>
                      <td>{{ order.customerName }}</td>
                      <td class="text-right font-semibold">\${{ order.totalAmount | number:'1.2-2' }}</td>
                      <td>
                        <span class="rf-badge" [ngClass]="getOrderBadge(order.status)">
                          {{ order.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div *ngIf="customerOrders.length === 0" class="rf-empty-state">
                  <div class="rf-empty-title">No Customer Orders Yet</div>
                  <div class="rf-empty-description">Orders placed by customers or store operators will appear here.</div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ============================================== -->
        <!-- 2. WAREHOUSE MANAGER DASHBOARD VIEW            -->
        <!-- ============================================== -->
        <ng-container *ngIf="isManager()">
          <div class="stats-grid">
            <div class="metric-card" routerLink="/inventory">
              <div class="metric-header">
                <span class="metric-title">MANAGED INVENTORY</span>
                <div class="metric-icon bg-emerald">📊</div>
              </div>
              <div class="metric-value">{{ inventoryList.length }}</div>
              <div class="metric-foot">Active Stock Records</div>
            </div>

            <div class="metric-card" routerLink="/inventory" [queryParams]="{ filter: 'low-stock' }">
              <div class="metric-header">
                <span class="metric-title">BELOW THRESHOLD</span>
                <div class="metric-icon bg-rose">⚠️</div>
              </div>
              <div class="metric-value text-danger">{{ lowStockItems.length }}</div>
              <div class="metric-foot">Immediate Attention</div>
            </div>

            <div class="metric-card" routerLink="/stock-transfers">
              <div class="metric-header">
                <span class="metric-title">PENDING TRANSFERS</span>
                <div class="metric-icon bg-indigo">🔄</div>
              </div>
              <div class="metric-value">{{ pendingTransfers.length }}</div>
              <div class="metric-foot">Awaiting Approval</div>
            </div>

            <div class="metric-card" routerLink="/purchase-orders">
              <div class="metric-header">
                <span class="metric-title">INBOUND SHIPMENTS</span>
                <div class="metric-icon bg-amber">📥</div>
              </div>
              <div class="metric-value">{{ pendingPurchaseOrders.length }}</div>
              <div class="metric-foot">To Receive</div>
            </div>
          </div>

          <!-- Manager Action Queue: Pending Transfers -->
          <div class="rf-card" style="margin-bottom: 1.75rem;">
            <div class="rf-card-header">
              <div class="card-title-wrap">
                <h2 class="rf-card-title">Pending Inter-Warehouse Transfers (Action Required)</h2>
                <span class="badge-count" *ngIf="pendingTransfers.length > 0">{{ pendingTransfers.length }}</span>
              </div>
              <a routerLink="/stock-transfers" class="rf-btn rf-btn-ghost rf-btn-sm">All Transfers →</a>
            </div>
            <div class="table-responsive">
              <table class="rf-table" *ngIf="pendingTransfers.length > 0">
                <thead>
                  <tr>
                    <th>Transfer ID</th>
                    <th>Product</th>
                    <th>From Warehouse</th>
                    <th>To Warehouse</th>
                    <th class="text-right">Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of pendingTransfers">
                    <td class="font-mono font-bold">#TRF-{{ t.transferId }}</td>
                    <td class="font-semibold">{{ t.product?.productName }}</td>
                    <td>{{ t.sourceWarehouse?.warehouseName }}</td>
                    <td>{{ t.destinationWarehouse?.warehouseName }}</td>
                    <td class="text-right font-bold">{{ t.quantity }} units</td>
                    <td>
                      <button (click)="completeTransfer(t)" class="rf-btn rf-btn-primary rf-btn-sm">
                        Approve & Move Stock
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div *ngIf="pendingTransfers.length === 0" class="rf-empty-state">
                <div class="rf-empty-title">All Transfers Processed</div>
                <div class="rf-empty-description">There are no pending stock movements requiring manager sign-off.</div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ============================================== -->
        <!-- 3. RETAILER / STORE OPERATOR DASHBOARD VIEW    -->
        <!-- ============================================== -->
        <ng-container *ngIf="isRetailer()">
          <div class="stats-grid">
            <div class="metric-card" routerLink="/products">
              <div class="metric-header">
                <span class="metric-title">AVAILABLE CATALOG</span>
                <div class="metric-icon bg-indigo">🏷️</div>
              </div>
              <div class="metric-value">{{ products.length }}</div>
              <div class="metric-foot">Products Available to Sell</div>
            </div>

            <div class="metric-card" routerLink="/customer-orders">
              <div class="metric-header">
                <span class="metric-title">STORE ORDERS</span>
                <div class="metric-icon bg-amber">🛍️</div>
              </div>
              <div class="metric-value">{{ customerOrders.length }}</div>
              <div class="metric-foot">Processed Sales</div>
            </div>

            <div class="metric-card" routerLink="/warehouses">
              <div class="metric-header">
                <span class="metric-title">FULFILLMENT HUBS</span>
                <div class="metric-icon bg-emerald">🏢</div>
              </div>
              <div class="metric-value">{{ warehouses.length }}</div>
              <div class="metric-foot">Stock Hubs Available</div>
            </div>
          </div>

          <!-- Retailer Quick Catalog & Stock View -->
          <div class="rf-card">
            <div class="rf-card-header">
              <h2 class="rf-card-title">Live Product Pricing & Catalog</h2>
              <a routerLink="/customer-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">+ Create Customer Order</a>
            </div>
            <div class="table-responsive">
              <table class="rf-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th class="text-right">Unit Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of products">
                    <td class="font-semibold">{{ p.productName }}</td>
                    <td><span class="font-mono text-muted">{{ p.sku }}</span></td>
                    <td>{{ p.category?.categoryName }}</td>
                    <td class="text-right font-bold">\${{ p.price | number:'1.2-2' }}</td>
                    <td>
                      <span class="rf-badge" [ngClass]="p.status === 'ACTIVE' ? 'rf-badge-success' : 'rf-badge-danger'">
                        {{ p.status }}
                      </span>
                    </td>
                    <td>
                      <a [routerLink]="['/customer-orders/new']" class="rf-btn rf-btn-secondary rf-btn-sm">
                        Sell / Order
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ng-container>

        <!-- ============================================== -->
        <!-- 4. PROCUREMENT / SUPPLIER DASHBOARD VIEW       -->
        <!-- ============================================== -->
        <ng-container *ngIf="isProcurement()">
          <div class="stats-grid">
            <div class="metric-card" routerLink="/suppliers">
              <div class="metric-header">
                <span class="metric-title">REGISTERED SUPPLIERS</span>
                <div class="metric-icon bg-indigo">🤝</div>
              </div>
              <div class="metric-value">{{ suppliers.length }}</div>
              <div class="metric-foot">Active Vendors</div>
            </div>

            <div class="metric-card" routerLink="/purchase-orders">
              <div class="metric-header">
                <span class="metric-title">PURCHASE ORDERS</span>
                <div class="metric-icon bg-amber">📄</div>
              </div>
              <div class="metric-value">{{ purchaseOrders.length }}</div>
              <div class="metric-foot">Total Issued</div>
            </div>

            <div class="metric-card" routerLink="/purchase-orders">
              <div class="metric-header">
                <span class="metric-title">PENDING DELIVERIES</span>
                <div class="metric-icon bg-rose">🚚</div>
              </div>
              <div class="metric-value">{{ pendingPurchaseOrders.length }}</div>
              <div class="metric-foot">Awaiting Receipt</div>
            </div>
          </div>

          <!-- Pending Purchase Orders to Receive -->
          <div class="rf-card">
            <div class="rf-card-header">
              <h2 class="rf-card-title">Pending Inbound Purchase Orders</h2>
              <a routerLink="/purchase-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">+ Create PO</a>
            </div>
            <div class="table-responsive">
              <table class="rf-table" *ngIf="pendingPurchaseOrders.length > 0">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Supplier</th>
                    <th>Destination</th>
                    <th>Order Date</th>
                    <th class="text-right">Total Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let po of pendingPurchaseOrders">
                    <td class="font-mono font-bold">#PO-{{ po.purchaseOrderId }}</td>
                    <td class="font-semibold">{{ po.supplier?.supplierName }}</td>
                    <td>{{ po.warehouse?.warehouseName }}</td>
                    <td class="text-muted">{{ po.orderDate }}</td>
                    <td class="text-right font-bold">\${{ po.totalAmount | number:'1.2-2' }}</td>
                    <td>
                      <span class="rf-badge rf-badge-warning">{{ po.status }}</span>
                    </td>
                    <td>
                      <button (click)="receivePurchaseOrder(po)" class="rf-btn rf-btn-primary rf-btn-sm">
                        Receive Stock
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div *ngIf="pendingPurchaseOrders.length === 0" class="rf-empty-state">
                <div class="rf-empty-title">No Pending Purchase Orders</div>
                <div class="rf-empty-description">Create a purchase order to replenish warehouse stock.</div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- ============================================== -->
        <!-- 5. CONSUMER / CUSTOMER DASHBOARD VIEW          -->
        <!-- ============================================== -->
        <ng-container *ngIf="isCustomer()">
          <div class="stats-grid">
            <div class="metric-card" routerLink="/products">
              <div class="metric-header">
                <span class="metric-title">STORE CATALOG</span>
                <div class="metric-icon bg-indigo">🛍️</div>
              </div>
              <div class="metric-value">{{ products.length }}</div>
              <div class="metric-foot">Products Available</div>
            </div>

            <div class="metric-card" routerLink="/customer-orders">
              <div class="metric-header">
                <span class="metric-title">MY ORDERS</span>
                <div class="metric-icon bg-emerald">📦</div>
              </div>
              <div class="metric-value">{{ customerOrders.length }}</div>
              <div class="metric-foot">Total Orders Placed</div>
            </div>

            <div class="metric-card" routerLink="/products">
              <div class="metric-header">
                <span class="metric-title">STORE STATUS</span>
                <div class="metric-icon bg-amber">✨</div>
              </div>
              <div class="metric-value">Active</div>
              <div class="metric-foot">Live Inventory Available</div>
            </div>
          </div>

          <div class="dashboard-grid">
            <!-- Catalog Preview -->
            <div class="rf-card">
              <div class="rf-card-header">
                <h2 class="rf-card-title">Featured Catalog Products</h2>
                <a routerLink="/products" class="rf-btn rf-btn-ghost rf-btn-sm">Browse Catalog →</a>
              </div>
              <div class="table-responsive">
                <table class="rf-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th class="text-right">Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of products">
                      <td class="font-semibold">{{ p.productName }}</td>
                      <td><span class="font-mono text-muted">{{ p.sku }}</span></td>
                      <td class="text-right font-bold text-primary">\${{ p.price | number:'1.2-2' }}</td>
                      <td>
                        <a routerLink="/customer-orders/new" class="rf-btn rf-btn-primary rf-btn-sm">
                          Order Now
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Customer Orders -->
            <div class="rf-card">
              <div class="rf-card-header">
                <h2 class="rf-card-title">My Recent Orders</h2>
                <a routerLink="/customer-orders" class="rf-btn rf-btn-ghost rf-btn-sm">All Orders →</a>
              </div>
              <div class="table-responsive">
                <table class="rf-table" *ngIf="customerOrders.length > 0">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th class="text-right">Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let order of customerOrders.slice(0, 5)">
                      <td class="font-mono font-bold">#ORD-{{ order.orderId }}</td>
                      <td class="text-right font-semibold">\${{ order.totalAmount | number:'1.2-2' }}</td>
                      <td>
                        <span class="rf-badge" [ngClass]="getOrderBadge(order.status)">
                          {{ order.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div *ngIf="customerOrders.length === 0" class="rf-empty-state">
                  <div class="rf-empty-title">No Orders Yet</div>
                  <div class="rf-empty-description">Place your first order by clicking Order Now above.</div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .live-sync-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
      animation: alertPulse 1.8s infinite;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-xs);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .metric-card:hover {
      border-color: var(--border-strong);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .metric-title {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .metric-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .bg-indigo { background: #eef2ff; }
    .bg-rose { background: #ffe4e6; }
    .bg-emerald { background: #ecfdf5; }
    .bg-amber { background: #fef3c7; }

    .metric-value {
      font-size: 1.875rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-main);
      line-height: 1.2;
    }

    .metric-foot {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 1.5rem;
    }
    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .card-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge-count {
      background: var(--danger-bg);
      color: var(--danger-text);
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 999px;
    }

    .text-danger { color: #dc2626; }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  loading = true;

  products: Product[] = [];
  warehouses: Warehouse[] = [];
  inventoryList: Inventory[] = [];
  lowStockItems: Inventory[] = [];
  suppliers: Supplier[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  customerOrders: CustomerOrder[] = [];
  stockTransfers: StockTransfer[] = [];

  pendingTransfers: StockTransfer[] = [];
  pendingPurchaseOrders: PurchaseOrder[] = [];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private purchaseOrderService: PurchaseOrderService,
    private customerOrderService: CustomerOrderService,
    private stockTransferService: StockTransferService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((u) => {
      this.currentUser = u;
      this.cdr.detectChanges();
    });

    this.loadAllData();
  }

  loadAllData() {
    this.loading = true;
    forkJoin({
      products: this.productService.getAll(),
      warehouses: this.warehouseService.getAll(),
      inventory: this.inventoryService.getAll(),
      lowStock: this.inventoryService.getLowStock(),
      suppliers: this.supplierService.getAll(),
      purchaseOrders: this.purchaseOrderService.getAll(),
      customerOrders: this.customerOrderService.getAll(),
      transfers: this.stockTransferService.getAll()
    }).subscribe({
      next: (res) => {
        this.products = res.products || [];
        this.warehouses = res.warehouses || [];
        this.inventoryList = res.inventory || [];
        this.lowStockItems = res.lowStock || [];
        this.suppliers = res.suppliers || [];
        this.purchaseOrders = res.purchaseOrders || [];
        this.customerOrders = res.customerOrders || [];
        this.stockTransfers = res.transfers || [];

        this.pendingTransfers = this.stockTransfers.filter(t => t.status === 'PENDING');
        this.pendingPurchaseOrders = this.purchaseOrders.filter(po => po.status === 'PENDING' || po.status === 'APPROVED');

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Failed to sync live data from Spring Boot API');
      }
    });
  }

  getRole(): string {
    return this.authService.getActiveRoleName();
  }

  isAdmin(): boolean { return this.getRole().includes('admin'); }
  isManager(): boolean { return this.getRole().includes('manager') || this.getRole().includes('moderator'); }
  isRetailer(): boolean { return this.getRole().includes('retail') || this.getRole().includes('store'); }
  isProcurement(): boolean { return this.getRole().includes('procure') || this.getRole().includes('suppli'); }
  isCustomer(): boolean { return this.getRole().includes('customer'); }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getRoleDashboardSubtitle(): string {
    if (this.isAdmin()) return 'Global Operations Overview & System Diagnostics';
    if (this.isManager()) return 'Warehouse Stock Levels, Movement Queue & Inbound Shipments';
    if (this.isRetailer()) return 'Live Product Catalog, Instant Availability & Sales Tracking';
    if (this.isProcurement()) return 'Supplier Relationships & Inbound Purchase Order Pipeline';
    return 'Customer Portal & Active Orders';
  }

  getOrderBadge(status?: string): string {
    switch (status) {
      case 'COMPLETED': return 'rf-badge-success';
      case 'PLACED': return 'rf-badge-info';
      case 'PROCESSING': return 'rf-badge-warning';
      case 'CANCELLED': return 'rf-badge-danger';
      default: return 'rf-badge-neutral';
    }
  }

  completeTransfer(transfer: StockTransfer) {
    if (!transfer.transferId) return;
    const updated = { ...transfer, status: 'COMPLETED' };
    this.stockTransferService.update(transfer.transferId, updated).subscribe({
      next: () => {
        this.notificationService.success(`Transfer #TRF-${transfer.transferId} approved and stock successfully transferred.`);
        this.loadAllData();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to complete stock transfer');
      }
    });
  }

  receivePurchaseOrder(po: PurchaseOrder) {
    if (!po.purchaseOrderId) return;
    const updated = { ...po, status: 'RECEIVED' };
    this.purchaseOrderService.update(po.purchaseOrderId, updated).subscribe({
      next: () => {
        this.notificationService.success(`Purchase Order #PO-${po.purchaseOrderId} received and stock credited to ${po.warehouse?.warehouseName}.`);
        this.loadAllData();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to receive purchase order');
      }
    });
  }
}
