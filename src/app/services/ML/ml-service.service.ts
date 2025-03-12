import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MlServiceService {
  private apiUrl = 'http://localhost:5000/predict'; // Flask API URL

  constructor(private http: HttpClient) { }

  predictCase(caseDescription: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { case_description: caseDescription };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
