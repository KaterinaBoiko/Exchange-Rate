import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { ConverterComponent } from './rates/converter/converter.component';
import { CurrencyDetailsComponent } from './rates/currency-details/currency-details.component';
import { AllRatesComponent } from './rates/all-rates/all-rates.component';
import { MainComponent } from './rates/main/main.component';
import { SettingsComponent } from './rates/settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'rates', component: AllRatesComponent },
  { path: 'converter', component: ConverterComponent },
  { path: 'settings', component: SettingsComponent },
  { path: ':currency', component: CurrencyDetailsComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
