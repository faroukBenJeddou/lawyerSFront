import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {Observable} from "rxjs";
import {Case} from "../../Models/Case";
import {Hearing} from "../../Models/Hearing";

@Injectable({
  providedIn: 'root'
})
export class HearingsService {

  private baseUrl='http://localhost:8081/hearing'
  private taskExecutedToday = false;  // Flag to track if task is executed today

  constructor(private http:HttpClient,private authService:AuthService) { }


// Assuming this is your method for handling the form submission
  createHearing(hearingData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Convert the local time selected by the user into an ISO string
    const startLocal = new Date(hearingData.start);  // '2025-02-12T16:06'
    const endLocal = new Date(hearingData.end);      // '2025-02-12T17:06'

    // Log before sending data to the backend (debugging)
    console.log('Sending hearing data:', {
      start: startLocal.toISOString(),  // Convert to ISO string: '2025-02-12T16:06:00.000Z'
      end: endLocal.toISOString()       // Convert to ISO string: '2025-02-12T17:06:00.000Z'
    });

    // Send to backend with correctly formatted dates
    hearingData.start = startLocal.toISOString();
    hearingData.end = endLocal.toISOString();

    return this.http.post<any>(`${this.baseUrl}/add`, hearingData, { headers });
  }

  assignHearing(hearingId: string, caseId: string): Observable<Case> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/${hearingId}/assign-to-case/${caseId}`;

    // Debugging URL and headers
    console.log(`URL: ${url}`);
    console.log(`Headers:`, headers);

    return this.http.post<Case>(url, {}, { headers });
  }
  getHearingsForCase(caseId: string): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/${caseId}/hearings`;

    // Debugging URL and headers
    console.log(`URL: ${url}`);
    console.log(`Headers:`, headers);

    return this.http.get<any[]>(url, { headers });
  }
  removeHearing(hearingId: string): Observable<Hearing> {  // Use singular if referring to a single document
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<Hearing>(`${this.baseUrl}/delete/${hearingId}`, { headers });
  }
  filterUpcomingHearings(): Observable<Hearing[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Hearing[]>(`${this.baseUrl}/filter-upcoming-hearings`, { headers });
  }




}
