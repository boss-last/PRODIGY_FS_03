import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getFeatured(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/featured`);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addReview(productId: string, review: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/${productId}/reviews`, review, { headers });
  }
}
