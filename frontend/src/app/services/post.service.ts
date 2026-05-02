import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:5000/api/posts';

  constructor(private http: HttpClient) {}

  getFeed(): Observable<any> {
    return this.http.get(`${this.apiUrl}/feed`);
  }

  createPost(data: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(this.apiUrl, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  likePost(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  addComment(postId: number, content: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/${postId}/comment`, { content }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
