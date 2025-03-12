import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthService} from "../auth.service";
import {Case} from "../../Models/Case";
import {Client} from "../../Models/Client";

@Injectable({
  providedIn: 'root'
})
export class CaseService {
  private baseUrl='http://localhost:8081/Affaire'

  constructor(private http:HttpClient,private authService:AuthService) { }

  getCaseByLawyerIdAndCaseId(lawyerId: string, caseId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.baseUrl}/${lawyerId}/cases/${caseId}`, { headers });
  }

  updateCase(lawyerId: string, caseId: string, caseData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<any>(`${this.baseUrl}/${lawyerId}/cases/${caseId}`, caseData, { headers });
  }
  createCase(caseData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/add`, caseData, { headers });
  }
  getCase(caseId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.baseUrl}/get/${caseId}`, { headers });
  }

  getCases(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
  deleteCase(caseId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.baseUrl}/delete/${caseId}`, { headers });
  }

  assignClientToCase(caseId: string, clientId: string): Observable<Case> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/${caseId}/assignCl/${clientId}`;
    return this.http.post<Case>(url, {}, { headers });
  }

  assignCaseToLawyer(lawyerId: string, caseId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/${caseId}/assignL/${lawyerId}`, {}, { headers });
  }
  getDocumentsForCase(caseId: string): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.baseUrl}/${caseId}/documents`, { headers });
  }
  getCaseByCL(clientId: string,lawyerId:string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.baseUrl}/getByLawyerClient/${clientId}/${lawyerId}`, { headers });
  }
  getCasesForLawyer(lawyerId:string): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any[]>(`${this.baseUrl}/getByLawyer/${lawyerId}`, { headers });
  }


 getClient(caseId:string): Observable<Client> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Client>(`${this.baseUrl}/${caseId}/client`, { headers });
  }
  predictCase(caseDescription: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.baseUrl, { case_description: caseDescription }, { headers });
  }
}
