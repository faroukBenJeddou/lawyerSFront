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

  constructor(private http:HttpClient,private authService:AuthService) { }


  createHearing(hearingData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
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

}
