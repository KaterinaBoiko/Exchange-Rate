import { Component, OnInit } from '@angular/core';
import { formatDate } from "@angular/common";
import { MatTableDataSource } from '@angular/material/table';

import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RateService } from 'src/app/core/services/rate.service';
import { ChartConfigs } from 'src/app/shared/classes/chart';
import { CHART_COLORS } from '../constants/chart-configs';
import { TranslateService } from '@ngx-translate/core';

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

  chartDetails: ChartConfigs;
  baseRates: any;
  colors = CHART_COLORS;
  forecastPeriod: number;
  loadingChart: boolean = false;
  loadingForecast: boolean = false;
  currTitle: string;

  constructor(
    private toastr: ToastrService,
    private rateService: RateService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.currencies = this.rateService.selectedCurrencies;
    this.currentCurrency.code = this.currencies[0];
    this.getDetails();
    this.currTitle = `${this.translateService.currentLang}_title`;
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

    this.loadRateForChart();
    localStorage.setItem('date', formatDate(this.date, 'yyyy-MM-dd', 'en-US'));
    this.isCurrentDateToday = formatDate(this.date, 'dd.MM.yyyy', 'en-US') === formatDate(new Date(), 'dd.MM.yyyy', 'en-US');
  }

  loadRateForChart(): void {
    this.loadingChart = true;
    this.forecastPeriod = null;
    const dateString = formatDate(this.date, 'yyyy-MM-dd', 'en-US');
    this.rateService.getForecastBaseRate(this.currentCurrency.code, dateString)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          this.baseRates = data;
          this.setChartData();
          this.loadingChart = false;
        },
        error => {
          this.showLoader = false;
          this.showError(error.message);
        }
      );
  }

  loadForecastData(): void {
    if (!this.forecastPeriod) {
      this.setChartData();
      return;
    }
    this.loadingForecast = true;
    this.rateService.getForecast(this.currentCurrency.code, this.forecastPeriod)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          this.setChartData(data);
          this.loadingForecast = false;
        },
        error => {
          this.loadingForecast = false;
          this.forecastPeriod = null;
          this.showError(error.statusText);
        }
      );
  }

  setChartData(forecast?: any): void {
    this.chartDetails = null;
    const datasets = [
      { label: `${this.translateService.instant('WEBSITES.NBU')} ${this.translateService.instant('RATES.RATE')}`, data: [], fill: false }
    ];
    const labels = [];
    this.baseRates.forEach(row => {
      datasets[0].data.push(row.rate_nb);
      labels.push(formatDate(row.date, 'dd.MM.yyyy', 'en-US'));
    });

    if (forecast) {
      datasets.push({
        label: this.translateService.instant('RATES.FORECAST'), data: [], fill: false
      });

      datasets[1].data[this.baseRates.length - 1] = datasets[0].data[this.baseRates.length - 1];
      for (let i = 0; i < forecast.length; i++) {
        datasets[1].data[this.baseRates.length + i] = forecast[i].forecast;
        labels.push(formatDate(forecast[i].date, 'dd.MM.yyyy', 'en-US'));
      }
    }

    const options = this.setOptions();

    this.chartDetails = new ChartConfigs(datasets, labels, options);
  }

  setOptions(): any {
    return {
      responsive: true,
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            fontColor: 'white',
          },
          gridLines: {
            color: '#5f5e5e'
          }
        }],
        yAxes: [{
          ticks: {
            fontColor: 'white'
          },
          gridLines: {
            color: '#5f5e5e'
          },
          scaleLabel: {
            display: true,
            fontColor: 'white',
          }
        }]
      },
      legend: {
        display: true,
        labels: {
          fontColor: 'white',
        },
      }
    };
  }

  showError(error: string) {
    this.toastr.error(error, this.translateService.instant('ERROR'));
  }
}
