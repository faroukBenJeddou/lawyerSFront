import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError, Observable, of, tap, throwError} from "rxjs";
import {Lawyer} from "../../Models/Lawyer";
import {AuthService} from "../auth.service";
import {Client} from "../../Models/Client";
import {Case} from "../../Models/Case";
import {Consultation} from "../../Models/Consultation";
import {Assistant} from "../../Models/Assistant";

@Injectable({
  providedIn: 'root'
})
export class LawyerServiceService {
  private baseUrl='http://localhost:8081/lawyer'
  errorMessage: string = ''; // Declare the errorMessage property

  constructor(private http:HttpClient,private authService:AuthService) {

  }

  getLawyers():Observable<Lawyer[]>{

      return this.http.get<Lawyer[]>(`${this.baseUrl}/all`);
    }
  getLawyerById(id: string): Observable<Lawyer> {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // No need for responseType if the backend returns JSON
    return this.http.get<Lawyer>(`${this.baseUrl}/${id}`, { headers });
  }

  getLawyerByEmail(email: string): Observable<Lawyer> {
    const token = localStorage.getItem('authToken'); // Retrieve the token from localStorage
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Lawyer>(`${this.baseUrl}/by-email/${email}`, { headers });
  }
  getClients(id: string): Observable<Client[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<Client[]>(`${this.baseUrl}/${id}/clients`, { headers }).pipe(
      catchError((error) => {
        // Handle errors here, in case the server returns an error
        console.error('Error fetching clients:', error);
        this.errorMessage = 'Unable to load clients, please try again later.';
        return of([]); // Return an empty array in case of error
      })
    );
  }

  getCases(id: string): Observable<Case[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Case[]>(`${this.baseUrl}/${id}/cases`, { headers });
  }
  getConsultations(id: string): Observable<Consultation[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Consultation[]>(`${this.baseUrl}/${id}/consultations`, { headers });
  }


  getAssistant(id: string): Observable<Assistant> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Token is missing');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Assistant>(`${this.baseUrl}/${id}/assistant`, { headers });
  }

  removeClientFromLawyer(lawyerId: string, clientId: string): Observable<Lawyer> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<Lawyer>(`${this.baseUrl}/${lawyerId}/remove-client/${clientId}`, { headers });
  }
  removeCaseFromLawyer(lawyerId: string, caseId: string): Observable<Lawyer> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<Lawyer>(`${this.baseUrl}/${lawyerId}/remove-client/${caseId}`, { headers });
  }

  createLawyer(lawyer: Lawyer): Observable<Lawyer> {
    return this.http.post<Lawyer>(`${this.baseUrl}`, lawyer);
  }
// lawyer-service.service.ts
  updateLawyer(id: string, lawyer: Lawyer): Observable<Lawyer> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });



    return this.http.put<Lawyer>(`${this.baseUrl}/update/${id}`, lawyer, { headers });
  }


  addClient(lawyerId: string, client: Client): Observable<Client> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<Client>(`${this.baseUrl}/add-to-lawyer/${lawyerId}`, client, { headers });
  }


  uploadProfilePicture(lawyerId: string, file: File): Observable<any> {
    const token = this.authService.getToken();
    const formData = new FormData();
    formData.append('image', file); // Ensure the key matches the @RequestParam name in the controller

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('Sending request to upload image...');
    return this.http.post<any>(`${this.baseUrl}/${lawyerId}/upload-photo`, formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Upload error:', error);
        return throwError(() => new Error('File upload failed'));
      })
    );
  }

  getImage(lawyerId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/image/${lawyerId}`, { responseType: 'blob' });
  }


  getImageById(lawyerId: string): Observable<Blob> {

    return this.http.get<Blob>(`${this.baseUrl}/image/${lawyerId}`, {

      responseType: 'blob' as 'json'
    });
  }




  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }






  isClientLinked(lawyerId:string,email: string): Observable<boolean> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<boolean>(`${this.baseUrl}/${lawyerId}/client/email/${email}`, { headers });
  }



  sendFollowRequest(lawyerId: string, email: string): Observable<string> {
    const token = this.authService.getToken(); // Get the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<string>(`${this.baseUrl}/sendFollowRequest?lawyerId=${lawyerId}&email=${email}`, {}, { headers })
      .pipe(
        tap((response) => {
          console.log('Response:', response);  // Log the successful response
        }),
        catchError((error) => {
          console.error('Error sending follow request:', error);
          return throwError('Failed to send follow request. Please try again later.');
        })
      );
  }



  changePassword(currentPassword: string, newPassword: string, confirmationPassword: string): Observable<any> {
    const token = this.authService.getToken(); // Get the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });


    const requestBody = { currentPassword, newPassword, confirmationPassword };
    return this.http.patch(`${this.baseUrl}/change-password`, requestBody, { headers });
  }


  deleteLawyer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }






}
