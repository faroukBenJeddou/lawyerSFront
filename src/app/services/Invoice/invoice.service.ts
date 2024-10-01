import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthService} from "../auth.service";
import {Invoice} from "../../Models/Invoice";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl='http://localhost:8081/invoice'

  constructor(private http:HttpClient,private authService:AuthService) { }


  // CaseService
  createInvoice(invoice: Invoice): Observable<Invoice> {
    const token = this.authService.getToken(); // Retrieve the token here
    return this.http.post<Invoice>(`${this.baseUrl}/add`, invoice, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Use the retrieved token
      })
    });
  }


  assignInvoiceToCase(invoiceId: string, caseId: string): Observable<any> {
    const token = this.authService.getToken(); // Retrieve the token here
    const body = {}; // Empty body if not needed

    return this.http.post<any>(`${this.baseUrl}/${invoiceId}/assign/${caseId}`, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', // Include Content-Type if needed
        'Authorization': `Bearer ${token}` // Use the retrieved token
      })
    });
  }

}
