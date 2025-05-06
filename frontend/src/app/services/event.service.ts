import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class EventService {
  private apiUrl = 'https://studivent-dhbw.de/api/events/';
  private apiKey = 'miwses-fIxnaf-5jinfy'; // capital "I"


  constructor(private http: HttpClient) {}

  fetchEvents(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-API-KEY': this.apiKey,
    });


    return this.http.get(this.apiUrl, { headers });
  }
}
