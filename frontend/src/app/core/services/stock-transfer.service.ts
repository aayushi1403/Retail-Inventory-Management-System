import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockTransfer } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {
  private apiUrl = `${environment.apiUrl}/stock-transfers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<StockTransfer[]> {
    return this.http.get<StockTransfer[]>(this.apiUrl);
  }

  getById(id: number): Observable<StockTransfer> {
    return this.http.get<StockTransfer>(`${this.apiUrl}/${id}`);
  }

  create(data: StockTransfer): Observable<StockTransfer> {
    return this.http.post<StockTransfer>(this.apiUrl, data);
  }

  update(id: number, data: StockTransfer): Observable<StockTransfer> {
    return this.http.put<StockTransfer>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
