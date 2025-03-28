import { Injectable } from '@angular/core';
import {AuthService} from "../auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  private baseUrl = 'http://localhost:8081/Client'
  private apiUrl='http://localhost:8081/lawyer'
  constructor(private http: HttpClient, private authService: AuthService) {
  }


  submitRating(clientId: string, lawyerId: string, rateValue: number): Observable<string> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(
      `${this.baseUrl}/${clientId}/rate/${lawyerId}?rateValue=${rateValue}`,
      {},
      { headers, responseType: 'text' } // ✅ Tell Angular to expect plain text
    );
  }
  getClientRating(clientId: string, lawyerId: string): Observable<number> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<number>(`${this.baseUrl}/${clientId}/rate/${lawyerId}`, { headers });
  }
  getAverageRating(lawyerId: string): Observable<number> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<number>(`${this.baseUrl}/average/${lawyerId}`, { headers });
  }
  getAverageRatingLawyer(lawyerId: string): Observable<number> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<number>(`${this.apiUrl}/${lawyerId}/average-rating`, { headers });
  }
}
