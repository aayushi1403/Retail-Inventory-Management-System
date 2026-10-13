ng g s core/services/product --skip-tests
ng g s core/services/category --skip-tests
ng g s core/services/inventory --skip-tests
ng g s core/services/warehouse --skip-tests
ng g s core/services/supplier --skip-tests
ng g s core/services/purchase-order --skip-tests
ng g s core/services/customer-order --skip-tests
ng g s core/services/stock-transfer --skip-tests

ng g c shared/sidebar --skip-tests
ng g c shared/topbar --skip-tests
ng g c shared/layout --skip-tests

ng g c features/dashboard/dashboard --skip-tests

ng g c features/products/product-list --skip-tests
ng g c features/products/product-form --skip-tests

ng g c features/categories/category-list --skip-tests
ng g c features/categories/category-form --skip-tests

ng g c features/inventory/inventory-list --skip-tests

ng g c features/warehouses/warehouse-list --skip-tests
ng g c features/warehouses/warehouse-form --skip-tests

ng g c features/suppliers/supplier-list --skip-tests
ng g c features/suppliers/supplier-form --skip-tests

ng g c features/purchase-orders/purchase-order-list --skip-tests
ng g c features/purchase-orders/purchase-order-form --skip-tests

ng g c features/customer-orders/customer-order-list --skip-tests
ng g c features/customer-orders/customer-order-form --skip-tests

ng g c features/stock-transfers/stock-transfer-list --skip-tests
ng g c features/stock-transfers/stock-transfer-form --skip-tests
