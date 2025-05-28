import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = 'https://studivent-dhbw.de/api';
  private readonly apiKey = 'miwses-fIxnaf-5jinfy';

  constructor(private http: HttpClient) {}

  /** 
   * GET /user/me 
   * Returns the current user (must be authenticated / API-key’d) 
   */
  getUser(): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
      // add e.g. Authorization here if you also need a Bearer token
    });

    return this.http.get<any>(`${this.baseUrl}/user/me`, { headers });
  }
}