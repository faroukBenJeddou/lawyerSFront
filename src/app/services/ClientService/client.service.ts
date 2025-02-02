import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {Lawyer} from "../../Models/Lawyer";
import {Client} from "../../Models/Client";
import {AuthService} from "../auth.service";
import {Case} from "../../Models/Case";
import {Consultation} from "../../Models/Consultation";
import {Documents} from "../../Models/Documents";

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private baseUrl = 'http://localhost:8081/Client'

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}`);
  }

  getClientById(id: string): Observable<Client> {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Client>(`${this.baseUrl}/get/${id}`, {headers});
  }

  getClientByEmail(email: string): Observable<Client> {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Client>(`${this.baseUrl}/by-email/${email}`, {headers});
  }

  getCases(id: string): Observable<Case[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Case[]>(`${this.baseUrl}/${id}/cases`, {headers});
  }

  getConsultations(id: string): Observable<any[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.baseUrl}/${id}/consultations`, {headers});
  }

  getDocuments(id: string): Observable<Documents[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Documents[]>(`${this.baseUrl}/${id}/documents`, {headers});
  }


  updateClient(id: string | null, client: Client): Observable<Client> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    return this.http.put<Client>(`${this.baseUrl}/update/${id}`, client, {headers});
  }

  getLawyers(id: string): Observable<Lawyer> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Lawyer>(`${this.baseUrl}/${id}/lawyer`, {headers});
  }

  uploadProfilePicture(clientId: string, file: File): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('image', file); // Ensure the key matches the @RequestParam name in the controller

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/${clientId}/upload-photo`, formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Upload error:', error);
        return throwError(() => new Error('File upload failed'));
      })
    );
  }

  getImageById(clientId: string): Observable<Blob> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Blob>(`${this.baseUrl}/image/${clientId}`, {
      headers,
      responseType: 'blob' as 'json'
    });
  }

  getClientByName(lawyerId: string, firstName?: string, familyName?: string): Observable<Client[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams().set('lawyerId', lawyerId); // Include lawyerId in the parameters
    if (firstName) params = params.set('firstName', firstName);
    if (familyName) params = params.set('familyName', familyName);

    return this.http.get<Client[]>(`${this.baseUrl}/find`, { headers, params });
  }


}
