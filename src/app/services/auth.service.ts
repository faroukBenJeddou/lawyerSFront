import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {User} from "../Models/User";
import {LoginPayload} from "../LoginPayload";
import Swal from "sweetalert2";
import {Router} from "@angular/router";
import jwtDecode from "jwt-decode";



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8081/auth/auth';
  private currentUser!: User;
  private inactivityTimeLimit = 5 * 60 * 1000; // 5 minutes in milliseconds
  private logoutTimer: any;
  private lastActivityTime: number = 0;

  constructor(private http: HttpClient, private router: Router) {
    this.resetActivityTimer();
    this.setupActivityListeners();
  }

  private resetActivityTimer() {
    this.lastActivityTime = new Date().getTime();

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, this.inactivityTimeLimit);
  }

  private setupActivityListeners() {
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, () => this.resetActivityTimer());
    });
  }

  getToken(): string | null {
    return localStorage.getItem('authToken'); // Ensure this key matches setToken
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token); // Ensure this key matches getToken
  }

  login(payload: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  createAccount(user: any): Observable<any> {
    const url="http://localhost:8081/auth/register"
    return this.http.post<any>(url, user);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    Swal.fire({
      title: 'Logged Out',
      icon: 'info',
      text: 'You have been logged out due to inactivity.',
      confirmButtonText: 'OK'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
      return new Date().getTime() > expiryTime;
    } catch (e) {
      return true; // If decoding fails, consider the token expired
    }
  }
  forgotPassword(email: string): Observable<void> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email }; // Format the payload as JSON
    return this.http.post<void>('http://localhost:8081/auth/forgot-password', body, { headers });
  }


  resetPassword(token: string, newPassword: string): Observable<any> {
    const body = { newPassword };
    return this.http.post<any>(`http://localhost:8081/auth/reset-password?token=${token}`, body).pipe(
      catchError(error => {
        console.error('Password reset error:', error);
        return throwError(() => new Error('Password reset failed'));
      })
    );
  }


}
