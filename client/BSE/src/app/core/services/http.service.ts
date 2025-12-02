import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly API_BASE_URL = 'http://localhost:5006/api';
  constructor(private http: HttpClient) {}

  get<TResponse>(endpoint: string, params?: HttpParams): Observable<TResponse> {
    return this.http.get<TResponse>(`${this.API_BASE_URL}/${endpoint}`, { params });
  }

  post<TRequest, TResponse>(endpoint: string, body: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(`${this.API_BASE_URL}/${endpoint}`, body);
  }

  put<TRequest, TResponse>(endpoint: string, body: TRequest): Observable<TResponse> {
    return this.http.put<TResponse>(`${this.API_BASE_URL}/${endpoint}`, body);
  }
  patch<TRequest, TResponse>(endpoint: string, body: TRequest): Observable<TResponse> {
    return this.http.patch<TResponse>(`${this.API_BASE_URL}/${endpoint}`, body);
  }

  delete<TRequest, TResponse>(endpoint: string, params?: HttpParams): Observable<TResponse> {
    return this.http.delete<TResponse>(`${this.API_BASE_URL}/${endpoint}`, { params });
  }
}
