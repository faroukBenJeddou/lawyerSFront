import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../Models/User";
import {LoginPayload} from "../LoginPayload";



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl='http://localhost:8081/auth/auth'
  constructor(private http:HttpClient) { }
  login(payload: LoginPayload): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }
}
