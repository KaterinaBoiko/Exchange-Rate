import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { User } from '../../../shared/classes/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();

  isAuthenticated: boolean;
  user: User;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isAuthenticated
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.user = this.authService.currentUser;
      });

    this.isAuthenticated = !!this.authService.currentUser;
    this.user = this.authService.currentUser;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  logout(): void {
    this.authService.logout();
  }

}
