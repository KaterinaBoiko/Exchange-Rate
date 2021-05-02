import { Component, OnInit, ViewChild } from '@angular/core';
import { formatDate } from "@angular/common";
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RateService } from '../../core/services/rate.service';

@Component({
  selector: 'app-all-rates',
  templateUrl: './all-rates.component.html',
  styleUrls: ['./all-rates.component.scss']
})
export class AllRatesComponent implements OnInit {
  private unsubscribe = new Subject<void>();

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  date: Date = localStorage.getItem('date') ? new Date(localStorage.getItem('date')) : new Date();
  showLoader: boolean = false;
  isCurrentDateToday: boolean = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private toastr: ToastrService,
    private rateService: RateService
  ) { }

  ngOnInit(): void {
    this.getRateByDate();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.date = new Date(event.value);
    this.getRateByDate();
  }

  setDateToday(): void {
    this.date = new Date();
    this.getRateByDate();
  }

  getRateByDate(): void {
    this.showLoader = true;
    const dateString = formatDate(this.date, 'dd.MM.yyyy', 'en-US');
    this.rateService.getRateByDate(dateString)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          data.sort((a, b) => a.currency.localeCompare(b.currency));
          data.sort(a => a.currency === 'USD' ? -1 : a.currency === 'EUR' ? -1 : 0);
          this.dataSource = new MatTableDataSource<any>(data);
          this.dataSource.paginator = this.paginator;
          this.showLoader = false;
        },
        error => {
          this.showLoader = false;
          this.showError(error.message);
        }
      );

    localStorage.setItem('date', formatDate(this.date, 'yyyy-MM-dd', 'en-US'));
    this.isCurrentDateToday = formatDate(this.date, 'dd.MM.yyyy', 'en-US') === formatDate(new Date(), 'dd.MM.yyyy', 'en-US');
  }

  showError(error: string) {
    this.toastr.error(error, 'Error');
  }
}
