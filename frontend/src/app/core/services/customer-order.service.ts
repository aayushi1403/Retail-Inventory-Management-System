import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerOrder } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CustomerOrderService {
  private apiUrl = `${environment.apiUrl}/customer-orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CustomerOrder[]> {
    return this.http.get<CustomerOrder[]>(this.apiUrl);
  }

  getById(id: number): Observable<CustomerOrder> {
    return this.http.get<CustomerOrder>(`${this.apiUrl}/${id}`);
  }

  create(data: CustomerOrder): Observable<CustomerOrder> {
    return this.http.post<CustomerOrder>(this.apiUrl, data);
  }

  update(id: number, data: CustomerOrder): Observable<CustomerOrder> {
    return this.http.put<CustomerOrder>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
