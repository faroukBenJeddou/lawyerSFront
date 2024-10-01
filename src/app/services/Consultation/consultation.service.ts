import { Injectable } from '@angular/core';
import {AuthService} from "../auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {Case} from "../../Models/Case";
import {Consultation} from "../../Models/Consultation";

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private baseUrl='http://localhost:8081/consultation'

  constructor(private http:HttpClient,private authService:AuthService) { }
  createConsultation(consultationData: any, clientId: string, lawyerId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // Ensure content type is JSON
    });

    // Pass clientId and lawyerId as URL parameters
    return this.http.post<any>(`${this.baseUrl}/add/${clientId}/${lawyerId}`, consultationData, { headers });
  }


  assignConsultationToLawyer(consId: string, lawyerId: string): Observable<Consultation> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/${consId}/assign-to-lawyer/${lawyerId}`;
    console.log('Assign URL:', url); // Add this line for debugging
    return this.http.post<Consultation>(url, {}, { headers });
  }



  getConsultationsForLawyer(lawyerId: string): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.baseUrl}/findByLawyer/${lawyerId}`, { headers });
  }

  createSolo(consultation: { title: string; start: Date }): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/create`, consultation, { headers });
  }


  assignClientToConsultation(consultationId: string, clientId: string): Observable<Case> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/${consultationId}/assign-to-client/${clientId}`;
    return this.http.post<Case>(url, {}, { headers });
  }
  deleteConsultation(consultationId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.baseUrl}/delete/${consultationId}`, { headers });
  }


  getAll(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}/getAll`, { headers });
  }




  getByBoth(clientId: string,lawyerId:string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}/getBy/${clientId}/${lawyerId}`, { headers });
  }




}
