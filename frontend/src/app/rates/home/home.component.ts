import { Component, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { formatDate } from "@angular/common";

import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RateService } from '../../core/services/rate.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private unsubscribe = new Subject<void>();

  dataSource = [];
  date: Date = new Date();
  showLoader: boolean = false;
  isCurrentDateToday: boolean = true;

  constructor(
    private toastr: ToastrService,
    private rateService: RateService
  ) { }

  ngOnInit(): void {
    this.getRateByDate(this.date);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.isCurrentDateToday = formatDate(event.value, 'dd.MM.yyyy', 'en-US') === formatDate(new Date(), 'dd.MM.yyyy', 'en-US');
    this.getRateByDate(event.value);
  }

  setDateToday(): void {
    this.date = new Date();
    this.isCurrentDateToday = true;
    this.getRateByDate(this.date);
  }

  getRateByDate(date: Date | string) {
    this.showLoader = true;
    const dateString = formatDate(date, 'dd.MM.yyyy', 'en-US');
    this.rateService.getRateByDate(dateString)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          data.sort((a, b) => a.currency === 'USD' ? -1 : a.currency === 'EUR' ? -1 : a.currency.localeCompare(b.currency));
          this.dataSource = data;
          this.showLoader = false;
        },
        error => {
          this.showLoader = false;
          this.showError(error.message);
        }
      );
  }

  showError(error: string) {
    this.toastr.error(error, 'Error');
  }

}
