const fs = require('fs');

const services = ["Product", "Category", "Inventory", "Warehouse", "Supplier", "PurchaseOrder", "CustomerOrder", "StockTransfer"];
const urls = ["products", "categories", "inventory", "warehouses", "suppliers", "purchase-orders", "customer-orders", "stock-transfers"];
const modelNames = ["Product", "Category", "Inventory", "Warehouse", "Supplier", "PurchaseOrder", "CustomerOrder", "StockTransfer"];

for (let i = 0; i < services.length; i++) {
    const serviceName = services[i];
    let fileName = urls[i] + ".service.ts";
    if (urls[i] === "inventory") fileName = "inventory.service.ts";
    if (urls[i] === "products") fileName = "product.service.ts";
    if (urls[i] === "categories") fileName = "category.service.ts";
    if (urls[i] === "warehouses") fileName = "warehouse.service.ts";
    if (urls[i] === "suppliers") fileName = "supplier.service.ts";
    if (urls[i] === "purchase-orders") fileName = "purchase-order.service.ts";
    if (urls[i] === "customer-orders") fileName = "customer-order.service.ts";
    if (urls[i] === "stock-transfers") fileName = "stock-transfer.service.ts";
    
    const modelName = modelNames[i];
    const url = urls[i];
    
    const content = `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ${modelName} } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ${serviceName}Service {
  private apiUrl = \`\${environment.apiUrl}/${url}\`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<${modelName}[]> {
    return this.http.get<${modelName}[]>(this.apiUrl);
  }

  getById(id: number): Observable<${modelName}> {
    return this.http.get<${modelName}>(\`\${this.apiUrl}/\${id}\`);
  }

  create(data: ${modelName}): Observable<${modelName}> {
    return this.http.post<${modelName}>(this.apiUrl, data);
  }

  update(id: number, data: ${modelName}): Observable<${modelName}> {
    return this.http.put<${modelName}>(\`\${this.apiUrl}/\${id}\`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(\`\${this.apiUrl}/\${id}\`);
  }
}
`;
    fs.writeFileSync(`D:/RetailManagement/frontend/src/app/core/services/${fileName}`, content);
}
console.log('Services generated.');
