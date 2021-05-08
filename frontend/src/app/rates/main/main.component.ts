import { Component, OnInit } from '@angular/core';
import { formatDate } from "@angular/common";
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';

import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RateService } from 'src/app/core/services/rate.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  private unsubscribe = new Subject<void>();

  currencies: string[];
  currentCurrency: { code: string, data: any; } = { code: null, data: null };
  date: Date = localStorage.getItem('date') ? new Date(localStorage.getItem('date')) : new Date();
  showLoader: boolean = false;
  isCurrentDateToday: boolean = true;
  bankDataSource: MatTableDataSource<any> = new MatTableDataSource();
  otherDataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(
    private toastr: ToastrService,
    private rateService: RateService
  ) { }

  ngOnInit(): void {
    this.currencies = this.rateService.selectedCurrencies;
    this.currentCurrency.code = this.currencies[0];
    this.getDetails();
  }

  selectCurrency(code: string): void {
    this.currentCurrency.code = code;
    this.currentCurrency.data = null;
    this.getDetails();
  }

  getDetails(): void {
    this.showLoader = true;
    const dateString = formatDate(this.date, 'dd.MM.yyyy', 'en-US');
    this.rateService.getCurrencyDetailsByDate(this.currentCurrency.code, dateString)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          this.currentCurrency.data = data;
          this.bankDataSource = this.currentCurrency.data.bankData;
          this.otherDataSource = this.currentCurrency.data.otherData;
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
