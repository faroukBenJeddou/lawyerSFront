import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {Observable} from "rxjs";
import {User} from "../../Models/User";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl='http://localhost:8081/user'
  constructor(private http:HttpClient,private authService: AuthService) { }

  getClientById(id: string): Observable<User> {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.baseUrl}/get/${id}`, { headers });
  }

  add(user: any): Observable<any> {
    const token = localStorage.getItem('authToken'); // Replace with the key used for storing token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.baseUrl}/add/`,user, { headers });
  }
}
