import { Injectable } from '@angular/core';
import {Lawyer} from "../../Models/Lawyer";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
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



  updateAssistant(id: string, assistant: Assistant): Observable<Assistant> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
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

}
