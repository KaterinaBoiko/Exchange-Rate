import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Song } from '../../../shared/classes/song';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  private unsubscribe = new Subject<void>();

  isAuthenticated: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.isAuthenticated
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
      });

    this.isAuthenticated = !!this.authService.currentUser;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
