import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { CategoryListComponent } from './features/categories/category-list/category-list.component';
import { CategoryFormComponent } from './features/categories/category-form/category-form.component';
import { InventoryListComponent } from './features/inventory/inventory-list/inventory-list.component';
import { WarehouseListComponent } from './features/warehouses/warehouse-list/warehouse-list.component';
import { WarehouseFormComponent } from './features/warehouses/warehouse-form/warehouse-form.component';
import { SupplierListComponent } from './features/suppliers/supplier-list/supplier-list.component';
import { SupplierFormComponent } from './features/suppliers/supplier-form/supplier-form.component';
import { PurchaseOrderListComponent } from './features/purchase-orders/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderFormComponent } from './features/purchase-orders/purchase-order-form/purchase-order-form.component';
import { CustomerOrderListComponent } from './features/customer-orders/customer-order-list/customer-order-list.component';
import { CustomerOrderFormComponent } from './features/customer-orders/customer-order-form/customer-order-form.component';
import { StockTransferListComponent } from './features/stock-transfers/stock-transfer-list/stock-transfer-list.component';
import { StockTransferFormComponent } from './features/stock-transfers/stock-transfer-form/stock-transfer-form.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      
      { path: 'products', component: ProductListComponent },
      { path: 'products/new', component: ProductFormComponent },
      { path: 'products/edit/:id', component: ProductFormComponent },
      
      { path: 'categories', component: CategoryListComponent },
      { path: 'categories/new', component: CategoryFormComponent },
      { path: 'categories/edit/:id', component: CategoryFormComponent },
      
      { path: 'inventory', component: InventoryListComponent },
      
      { path: 'warehouses', component: WarehouseListComponent },
      { path: 'warehouses/new', component: WarehouseFormComponent },
      { path: 'warehouses/edit/:id', component: WarehouseFormComponent },
      
      { path: 'suppliers', component: SupplierListComponent },
      { path: 'suppliers/new', component: SupplierFormComponent },
      { path: 'suppliers/edit/:id', component: SupplierFormComponent },
      
      { path: 'purchase-orders', component: PurchaseOrderListComponent },
      { path: 'purchase-orders/new', component: PurchaseOrderFormComponent },
      
      { path: 'customer-orders', component: CustomerOrderListComponent },
      { path: 'customer-orders/new', component: CustomerOrderFormComponent },
      
      { path: 'stock-transfers', component: StockTransferListComponent },
      { path: 'stock-transfers/new', component: StockTransferFormComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
