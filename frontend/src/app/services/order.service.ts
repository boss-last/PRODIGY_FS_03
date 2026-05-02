import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, orderData, { headers: this.getHeaders() });
  }

  getMyOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my`, { headers: this.getHeaders() });
  }

  getOrderById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  cancelOrder(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() });
  }
}
