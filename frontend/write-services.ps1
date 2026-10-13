$services = @("Product", "Category", "Inventory", "Warehouse", "Supplier", "PurchaseOrder", "CustomerOrder", "StockTransfer")
$urls = @(
    "products", "categories", "inventory", "warehouses", "suppliers", "purchase-orders", "customer-orders", "stock-transfers"
)
$modelNames = @("Product", "Category", "Inventory", "Warehouse", "Supplier", "PurchaseOrder", "CustomerOrder", "StockTransfer")

for ($i=0; $i -lt $services.Length; $i++) {
    $serviceName = $services[$i]
    $fileName = $urls[$i] + ".service.ts"
    if ($urls[$i] -eq "inventory") {
        $fileName = "inventory.service.ts"
    }
    if ($urls[$i] -eq "products") { $fileName = "product.service.ts" }
    if ($urls[$i] -eq "categories") { $fileName = "category.service.ts" }
    if ($urls[$i] -eq "warehouses") { $fileName = "warehouse.service.ts" }
    if ($urls[$i] -eq "suppliers") { $fileName = "supplier.service.ts" }
    if ($urls[$i] -eq "purchase-orders") { $fileName = "purchase-order.service.ts" }
    if ($urls[$i] -eq "customer-orders") { $fileName = "customer-order.service.ts" }
    if ($urls[$i] -eq "stock-transfers") { $fileName = "stock-transfer.service.ts" }
    
    $modelName = $modelNames[$i]
    $url = $urls[$i]
    
    $content = @"
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { $modelName } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class $($serviceName)Service {
  private apiUrl = `\${environment.apiUrl}/$url`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<$modelName[]> {
    return this.http.get<$modelName[]>(this.apiUrl);
  }

  getById(id: number): Observable<$modelName> {
    return this.http.get<$modelName>(`\${this.apiUrl}/\${id}`);
  }

  create(data: $modelName): Observable<$modelName> {
    return this.http.post<$modelName>(this.apiUrl, data);
  }

  update(id: number, data: $modelName): Observable<$modelName> {
    return this.http.put<$modelName>(`\${this.apiUrl}/\${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`\${this.apiUrl}/\${id}`);
  }
}
"@
    Set-Content -Path "D:\RetailManagement\frontend\src\app\core\services\$fileName" -Value $content
}
