import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RateService } from '../../core/services/rate.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private unsubscribe = new Subject<void>();

  showLoader: boolean = false;
  selectedLanguage: string;
  allCurrencies: { currency: string, en_title: string; ua_title: string; ru_title: string; };
  selectedCurrencies: string[];
  currTitle: string;

  constructor(
    private toastr: ToastrService,
    private translateService: TranslateService,
    private rateService: RateService
  ) { }

  ngOnInit(): void {
    this.selectedLanguage = this.translateService.currentLang || this.translateService.defaultLang;
    this.selectedCurrencies = this.rateService.selectedCurrencies;
    this.getCurrencies();
    this.currTitle = `${this.translateService.currentLang}_title`;
  }

  onChangeLanguage(language: string): void {
    this.translateService.use(language);
    this.currTitle = `${language}_title`;
    localStorage.setItem('language', language);
  }

  onChangeSelectedCurrencies(): void {
    this.rateService.setSelectedCurrencies(this.selectedCurrencies);
  }

  getCurrencies(): void {
    this.showLoader = true;
    this.rateService.getCurrencies()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        data => {
          this.allCurrencies = data
            .sort((a, b) => a.currency.localeCompare(b.currency))
            .sort(a => a.currency === 'USD' ? -1 : a.currency === 'EUR' ? -1 : 0);

          this.showLoader = false;
        },
        error => {
          this.showLoader = false;
          this.showError(error.message);
        }
      );
  }

  showError(error: string): void {
    this.toastr.error(error, 'Error');
  }

}
