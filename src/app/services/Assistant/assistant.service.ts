import { Injectable } from '@angular/core';
import {Lawyer} from "../../Models/Lawyer";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {Assistant} from "../../Models/Assistant";

@Injectable({
  providedIn: 'root'
})
export class AssistantService {

  private baseUrl='http://localhost:8081/Assistant'

  constructor(private http:HttpClient,private authService:AuthService) {

  }



  updateAssistant(id: string, assistant: Assistant): Observable<Assistant> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<Assistant>(`${this.baseUrl}/update/${id}`, assistant, { headers });
  }
  getAssistantById(id: string) {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Assistant>(`/api/assistants/${id}`, { headers }); // Adjust API endpoint accordingly
  }
}
