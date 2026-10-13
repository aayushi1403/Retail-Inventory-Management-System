export interface Category {
  categoryId?: number;
  categoryName: string;
  description?: string;
  status?: string;
}

export interface Product {
  productId?: number;
  category: Category;
  productName: string;
  sku: string;
  description?: string;
  price: number;
  reorderLevel?: number;
  status?: string;
  createdAt?: string;
}

export interface Warehouse {
  warehouseId?: number;
  warehouseName: string;
  location: string;
  managerName?: string;
  contactNumber?: string;
  status?: string;
  createdAt?: string;
}

export interface Inventory {
  inventoryId?: number;
  product: Product;
  warehouse: Warehouse;
  quantity: number;
  reservedQuantity: number;
  lastUpdated?: string;
}

export interface Supplier {
  supplierId?: number;
  supplierName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
}

export interface PurchaseOrder {
  purchaseOrderId?: number;
  supplier: Supplier;
  warehouse: Warehouse;
  createdBy?: any; // User model if needed
  orderDate: string;
  expectedDate?: string;
  status?: string;
  totalAmount: number;
}

export interface CustomerOrder {
  orderId?: number;
  warehouse: Warehouse;
  orderDate?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  status?: string;
  totalAmount: number;
}

export interface StockTransfer {
  transferId?: number;
  product: Product;
  sourceWarehouse: Warehouse;
  destinationWarehouse: Warehouse;
  quantity: number;
  transferDate?: string;
  status?: string;
  createdBy?: any; // User model if needed
}
