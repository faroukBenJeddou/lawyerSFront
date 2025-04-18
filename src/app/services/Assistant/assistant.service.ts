import { Injectable } from '@angular/core';
import {Lawyer} from "../../Models/Lawyer";
import {catchError, Observable, tap, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {Assistant} from "../../Models/Assistant";
import {Client} from "../../Models/Client";

@Injectable({
  providedIn: 'root'
})
export class AssistantService {

  private baseUrl='http://localhost:8081/assistant'
  private api='http://localhost:8081/lawyer'

  constructor(private http:HttpClient,private authService:AuthService) {

  }

  uploadProfilePicture(assistantId: string, file: File): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('image', file); // Ensure the key matches the @RequestParam name in the controller

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Sending request to upload image...');
    return this.http.post<any>(`${this.baseUrl}/${assistantId}/upload-photo`, formData, {
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


  updateAssistant(id: string, assistant: Assistant): Observable<Assistant> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });



    return this.http.put<Assistant>(`${this.baseUrl}/update/${id}`, assistant, { headers });
  }


  getAssistantById(id: string | null) {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Assistant>(`${this.baseUrl}/get/${id}`, { headers }); // Adjust API endpoint accordingly
  }
  getAssistantByEmail(email: string): Observable<Assistant> {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Assistant>(`${this.api}/assistant/${email}`, {headers});
  }

  isLawyerLinked(assistantId: string | null, email: string): Observable<boolean> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<boolean>(`${this.baseUrl}/is-linked/${email}`, { headers });
  }
  affectAssistantToLawyer(lawyerId: string, assistantId: string): Observable<any> {
    const token = this.authService.getToken(); // Get token using AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Sending POST request to affect client to lawyer
    return this.http.post<any>(`${this.baseUrl}/affect-to-lawyer/${lawyerId}/${assistantId}`, {}, { headers });
  }
  getImageById(assistantId: string): Observable<Blob> {
    const token = this.authService.getToken(); // Get token using AuthService
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.baseUrl}/image/${assistantId}`, {
      headers: headers,  // ✅ Include headers here
      responseType: 'blob'  // ✅ Correct response type
    });
  }

  sendFollowRequestToLawyer(assistantId: string | null, email: string): Observable<string> {
    const token = this.authService.getToken(); // Get the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<string>(`${this.baseUrl}/sendFollowRequest?assistantId=${assistantId}&email=${email}`, {}, { headers })
      .pipe(
        tap((response) => {
          console.log('Response:', response);  // Log the successful response
        }),
        catchError((error) => {
          console.error('Error sending follow request:', error);
          return throwError('Failed to send follow request. Please try again later.');
        })
      );
  }
}
