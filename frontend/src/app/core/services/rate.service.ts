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
      `${this.apiUrl}/rates/${date}`);
  }

  getCurrencyPairs(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/rates/currency-pairs`);
  }

  getCurrentNBURate(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/rates/current-nbu-rate`);
  }

  getCurrencyDetails(currency: string, dateFrom?: string, dateTo?: string): Observable<any> {
    let params = new HttpParams();
    if (dateFrom)
      params = params.append('from', dateFrom);
    if (dateTo)
      params = params.append('to', dateTo);

    return this.http.get(
      `${this.apiUrl}/rates/details/${currency}`, { params });
  }

  convert(amount: number, currency: string, base_currency: string): Observable<any> {
    const params = new HttpParams()
      .append('amount', amount.toString())
      .append('currency', currency)
      .append('base_currency', base_currency);

    return this.http.get(
      `${this.apiUrl}/rates/convert`, { params });
  }
}
