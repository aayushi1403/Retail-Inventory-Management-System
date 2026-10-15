import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { CategoryListComponent } from './features/categories/category-list/category-list.component';
import { InventoryListComponent } from './features/inventory/inventory-list/inventory-list.component';
import { WarehouseListComponent } from './features/warehouses/warehouse-list/warehouse-list.component';
import { SupplierListComponent } from './features/suppliers/supplier-list/supplier-list.component';
import { PurchaseOrderListComponent } from './features/purchase-orders/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderFormComponent } from './features/purchase-orders/purchase-order-form/purchase-order-form.component';
import { CustomerOrderListComponent } from './features/customer-orders/customer-order-list/customer-order-list.component';
import { CustomerOrderFormComponent } from './features/customer-orders/customer-order-form/customer-order-form.component';
import { StockTransferListComponent } from './features/stock-transfers/stock-transfer-list/stock-transfer-list.component';
import { StockTransferFormComponent } from './features/stock-transfers/stock-transfer-form/stock-transfer-form.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Products & Catalog
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent, data: { roles: ['admin', 'manager', 'procurement'] } },
      { path: 'products/edit/:id', component: ProductFormComponent, data: { roles: ['admin', 'manager', 'procurement'] } },

      // Categories
      { path: 'categories', component: CategoryListComponent, data: { roles: ['admin'] } },

      // Inventory & Stock
      { path: 'inventory', component: InventoryListComponent },

      // Warehouses
      { path: 'warehouses', component: WarehouseListComponent, data: { roles: ['admin', 'manager'] } },

      // Suppliers
      { path: 'suppliers', component: SupplierListComponent, data: { roles: ['admin', 'procurement', 'manager'] } },

      // Purchase Orders
      { path: 'purchase-orders', component: PurchaseOrderListComponent, data: { roles: ['admin', 'procurement', 'manager'] } },
      { path: 'purchase-orders/new', component: PurchaseOrderFormComponent, data: { roles: ['admin', 'procurement', 'manager'] } },

      // Customer Sales Orders
      { path: 'customer-orders', component: CustomerOrderListComponent },
      { path: 'customer-orders/new', component: CustomerOrderFormComponent },

      // Stock Transfers
      { path: 'stock-transfers', component: StockTransferListComponent, data: { roles: ['admin', 'manager'] } },
      { path: 'stock-transfers/new', component: StockTransferFormComponent, data: { roles: ['admin', 'manager'] } },

      // Users & Administration (Admin only)
      { path: 'users', component: UserListComponent, data: { roles: ['admin'] } }
    ]
  },
  { path: '**', redirectTo: '' }
];
