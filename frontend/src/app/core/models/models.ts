export interface Role {
  roleId?: number;
  roleName: string;
  description?: string;
}

export interface User {
  userId?: number;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: Role;
  roleName?: string;
  roleDescription?: string;
  status?: string;
  createdAt?: string;
  permissions?: string[];
}

export interface Category {
  categoryId?: number;
  categoryName: string;
  description?: string;
  status?: string;
}

export interface Product {
  productId?: number;
  category?: Category;
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
  createdBy?: User;
  orderDate: string;
  expectedDate?: string;
  status?: string;
  totalAmount: number;
}

export interface PurchaseOrderItem {
  purchaseOrderItemId?: number;
  purchaseOrder?: PurchaseOrder;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
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

export interface OrderItem {
  orderItemId?: number;
  order?: CustomerOrder;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface StockTransfer {
  transferId?: number;
  product: Product;
  sourceWarehouse: Warehouse;
  destinationWarehouse: Warehouse;
  quantity: number;
  transferDate?: string;
  status?: string;
  createdBy?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  timestamp: Date;
}
