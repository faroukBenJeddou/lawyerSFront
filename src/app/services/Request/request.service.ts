import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {catchError, Observable, tap, throwError} from "rxjs";
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
  getNotificationsForAssistant(assistantId: string): Observable<Requests[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'  // Ensure content type is set
    });

    // Pass headers as part of an options object
    return this.http.get<Requests[]>(`${this.baseUrl}/AssNotifications/${assistantId}`, { headers });
  }

  updateRequestStatus(id: string, status: 'ACCEPTED' | 'DECLINED'): Observable<void> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token is missing');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Send status as a query parameter
    return this.http.post<void>(`${this.baseUrl}/${id}/respond?status=${status}`, {}, { headers });
  }




  getRequestById(id: string): Observable<Requests> {
    console.log(`Fetching request with ID: ${id}`);
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Requests>(`${this.baseUrl}/get/${id}`, { headers }).pipe(
      tap(response => {
        console.log('Fetched request data:', response);
      }),
      catchError(err => {
        console.error('Error fetching request:', err);
        return throwError(() => new Error('Failed to fetch request'));
      })
    );
  }
  updateNotification(request: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.baseUrl}/update/${request.id}`, request, { headers });
  }


  deleteRequest(id: string): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`, { headers });
  }

}
