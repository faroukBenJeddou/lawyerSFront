import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {Observable} from "rxjs";
import {Requests} from "../../Models/Requests";
import {ConsultationStatus} from "../../Models/ConsultationStatus";
import {Lawyer} from "../../Models/Lawyer";

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private baseUrl='http://localhost:8081/request'

  constructor(private http:HttpClient,private authService:AuthService) { }


  createRequest(request: Requests, clientId: string, lawyerId: string): Observable<Requests> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // Ensure content type is set
    });
    return this.http.post<Requests>(`${this.baseUrl}/add/${clientId}/${lawyerId}`, request, { headers });
  }

  getNotifications(lawyerId: string): Observable<Requests[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<Requests[]>(`${this.baseUrl}/notifications/${lawyerId}`, { headers });
  }


  markAsRead(requestId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // Ensure content type is set
    });
    return this.http.post<any>(`${this.baseUrl}/markAsRead/${requestId}`, headers,{});
  }
  getNotificationsForClient(clientId: string): Observable<Requests[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // Ensure content type is set
    });

    // Pass headers as part of an options object
    return this.http.get<Requests[]>(`${this.baseUrl}/ClientNotifications/${clientId}`, { headers });
  }

  updateRequestStatus(requestId: string, status: 'ACCEPTED' | 'DECLINED'): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams().set('status', status);
    return this.http.post<void>(`${this.baseUrl}/requests/${requestId}/respond`, null, { headers, params });
  }



  getRequestById(id: string): Observable<Requests> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Requests>(`${this.baseUrl}/get/${id}`, { headers });
  }
  deleteRequest(requestId: string): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.delete<void>(`${this.baseUrl}/delete/${requestId}`, { headers });
  }

}
