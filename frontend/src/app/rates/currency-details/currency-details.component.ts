import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChartConfigs } from 'src/app/shared/classes/chart';

import { RateService } from '../../core/services/rate.service';
import { CHART_COLORS } from '../constants/chart-configs';
@Component({
  selector: 'app-currency-details',
  templateUrl: './currency-details.component.html',
  styleUrls: ['./currency-details.component.scss']
})

export class CurrencyDetailsComponent implements OnInit {
  private unsubscribe = new Subject<void>();

  currency: string;
  showLoader: boolean = false;
  noData: boolean = false;
  details: any;
  chartDetails: ChartConfigs;
  colors = CHART_COLORS;

  startDate: Date = localStorage.getItem('startDate') ? new Date(localStorage.getItem('startDate')) : new Date();
  endDate: Date = localStorage.getItem('endDate') ? new Date(localStorage.getItem('endDate')) : new Date();
  maxDate: Date = new Date();
  currTitle: string;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private rateService: RateService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.currency = this.route.snapshot.paramMap.get('currency');
    if (!localStorage.getItem('endDate')) {
      this.startDate.setMonth(this.startDate.getMonth() - 4);
    }
    this.getCurrencyDetails();
    this.currTitle = `${this.translateService.currentLang}_title`;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getCurrencyDetails(): void {
    if (!this.endDate)
      return;

    this.showLoader = true;
    this.rateService.getCurrencyDetails(this.currency, formatDate(this.startDate, 'yyyy-MM-dd', 'en-US'), formatDate(this.endDate, 'yyyy-MM-dd', 'en-US'))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          this.showLoader = false;
          this.details = data;
          if (!this.details.length) {
            this.noData = true;
            return;
          }
          this.details.sort((a, b) => a.date > b.date ? 1 : -1);
          this.setChartDetails();
        },
        error => {
          this.showLoader = false;
          this.showError(error.message);
        }
      );

    localStorage.setItem('startDate', formatDate(this.startDate, 'yyyy-MM-dd', 'en-US'));
    localStorage.setItem('endDate', formatDate(this.endDate, 'yyyy-MM-dd', 'en-US'));
  }

  setChartDetails(): void {
    let datasets = [
      { label: `${this.translateService.instant('WEBSITES.NBU')} ${this.translateService.instant('RATES.RATE')}`, data: [], fill: false },
      { label: `${this.translateService.instant('BANKS.PRIVAT')} ${this.translateService.instant('RATES.PURCHASE')}`, data: [], fill: false },
      { label: `${this.translateService.instant('BANKS.PRIVAT')} ${this.translateService.instant('RATES.SALE')}`, data: [], fill: false },
      { label: `${this.translateService.instant('BANKS.MONO')} ${this.translateService.instant('RATES.PURCHASE')}`, data: [], fill: false },
      { label: `${this.translateService.instant('BANKS.MONO')} ${this.translateService.instant('RATES.SALE')}`, data: [], fill: false },
      { label: `${this.translateService.instant('WEBSITES.CURRENCY_LAYER')} ${this.translateService.instant('RATES.RATE')}`, data: [], fill: false },
      { label: `${this.translateService.instant('WEBSITES.FIXER')} ${this.translateService.instant('RATES.RATE')}`, data: [], fill: false },
    ];
    const labels = [];
    this.details.forEach(row => {
      datasets[0].data.push(row.rate_nb);
      datasets[1].data.push(row.purchase_privat);
      datasets[2].data.push(row.sale_privat);
      datasets[3].data.push(row.purchase_mono);
      datasets[4].data.push(row.sale_mono);
      datasets[5].data.push(row.layer_rate);
      datasets[6].data.push(row.fixer_rate);

      labels.push(formatDate(row.date, 'dd.MM.yyyy', 'en-US'));
    });

    const options = this.setOptions(this.details);
    datasets = datasets.filter(dataset => dataset.data.some(data => data));

    this.chartDetails = new ChartConfigs(datasets, labels, options);
  }

  setOptions(data): any {
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
            fontColor: 'white',
            min: Math.floor(Math.min(...data.map(row => row.purchase_privat ? row.purchase_privat : row.rate_nb), 100)),
            max: Math.ceil(Math.max(...data.map(row => row.sale_privat ? row.sale_privat : row.rate_nb), 0))
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
