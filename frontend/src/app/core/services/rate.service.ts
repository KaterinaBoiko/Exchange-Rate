import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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

  getCurrencyPairs(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/currency-pairs`);
  }

  getCurrentNBURate(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/current-nbu-rate`);
  }

  convert(amount: number, currency: string, base_currency: string): Observable<any> {
    const params = new HttpParams()
      .append('amount', amount.toString())
      .append('currency', currency)
      .append('base_currency', base_currency);

    return this.http.get(
      `${this.apiUrl}/convert`, { params });
  }
}
