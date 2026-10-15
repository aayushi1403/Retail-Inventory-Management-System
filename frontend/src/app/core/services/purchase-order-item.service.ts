import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PurchaseOrderItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderItemService {
  private apiUrl = `${environment.apiUrl}/purchase-order-items`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseOrderItem[]> {
    return this.http.get<PurchaseOrderItem[]>(this.apiUrl);
  }

  getByOrderId(orderId: number): Observable<PurchaseOrderItem[]> {
    return this.http.get<PurchaseOrderItem[]>(`${this.apiUrl}/order/${orderId}`);
  }

  create(item: PurchaseOrderItem): Observable<PurchaseOrderItem> {
    return this.http.post<PurchaseOrderItem>(this.apiUrl, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
