import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderItem } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OrderItemService {
  private apiUrl = `${environment.apiUrl}/order-items`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(this.apiUrl);
  }

  getByOrderId(orderId: number): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(`${this.apiUrl}/order/${orderId}`);
  }

  create(item: OrderItem): Observable<OrderItem> {
    return this.http.post<OrderItem>(this.apiUrl, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
