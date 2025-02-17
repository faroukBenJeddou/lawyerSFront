import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {Observable} from "rxjs";
import {Case} from "../../Models/Case";
import {Lawyer} from "../../Models/Lawyer";
import {Documents} from "../../Models/Documents";

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private baseUrl='http://localhost:8081/document'

  constructor(private http:HttpClient,private authService:AuthService) { }


  createDocument(documentData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.baseUrl}/add`, documentData, { headers });
  }

  uploadDoc(file:File,title:string,caseId?: string):Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (caseId) {
      formData.append('caseId', caseId);
    }
    return this.http.post<any>(`${this.baseUrl}/upload`, formData, { headers });

  }
  downloadDocument(documentId: string): Observable<Blob> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/download/${documentId}`, {
      headers,
      responseType: 'blob' // Important for handling binary data
    });
  }

  assignDocumentToCase(DocId: string, caseId: string): Observable<Case> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/assign-to-case/${DocId}/${caseId}`;
    return this.http.post<Case>(url, {}, { headers });
  }

  removeDocument(documentId: string): Observable<Document> {  // Use singular if referring to a single document
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<Document>(`${this.baseUrl}/delete/${documentId}`, { headers });
  }


}
