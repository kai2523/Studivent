import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private logoutUrl = 'https://studivent-dhbw.de/users/logout'; // Replace with actual endpoint

  constructor(private http: HttpClient) {}

  logout(): Observable<any> {
    return this.http.post(this.logoutUrl, {}); // Add body or headers if needed
  }
}
