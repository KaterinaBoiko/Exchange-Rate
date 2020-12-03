import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from 'src/app/shared/classes/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(false);

  apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  get currentUser(): User {
    return JSON.parse(localStorage.getItem('user'));
  }

  get isAuthenticated(): Observable<boolean> {
    return this.authenticated.asObservable();
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.authenticated.next(true);
  }

  login(user: User): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/signin`,
      { ...user });
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(
      `${this.apiUrl}/signup`,
      { ...user });
  }

  logout(): void {
    this.authenticated.next(false);
    localStorage.removeItem('user');
    this.router.navigate(['/', 'login']);
  }
}
