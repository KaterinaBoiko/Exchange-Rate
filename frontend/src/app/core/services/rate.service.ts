import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RateService {

  apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  getRateByDate(date: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/rate/${date}`);
  }
}
