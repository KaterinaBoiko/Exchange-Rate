import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private rateService: RateService
  ) { }

  ngOnInit(): void {
    this.currency = this.route.snapshot.paramMap.get('currency');
    this.getCurrencyDetails();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getCurrencyDetails(): void {
    this.showLoader = true;
    this.rateService.getCurrencyDetails(this.currency)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          this.showLoader = false;
          this.details = data;
          if (!this.details.data.length) {
            this.noData = true;
            return;
          }
          this.details.data.sort((a, b) => a.date > b.date ? 1 : -1);
          this.setChartDetails();
        },
        error => {
          this.showLoader = false;
          this.showError(error.message);
        }
      );
  }

  setChartDetails(): void {
    const { data } = this.details;
    const datasets = [
      { label: 'NBU rate', data: [], fill: false },
      { label: 'PrivatBank purchase', data: [], fill: false },
      { label: 'PrivatBank sale', data: [], fill: false },
      { label: 'Mono purchase', data: [], fill: false },
      { label: 'Mono sale', data: [], fill: false },
      { label: 'World rate', data: [], fill: false }
    ];
    const labels = [];
    data.forEach(row => {
      datasets[0].data.push(row.rate_nb);
      datasets[1].data.push(row.purchase_privat);
      datasets[2].data.push(row.sale_privat);
      datasets[3].data.push(row.purchase_mono);
      datasets[4].data.push(row.sale_mono);
      datasets[5].data.push(row.world_rate);

      labels.push(formatDate(row.date, 'dd.MM.yyyy', 'en-US'));
    });

    const options = this.setOptions(data);

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
    this.toastr.error(error, 'Error');
  }

}
