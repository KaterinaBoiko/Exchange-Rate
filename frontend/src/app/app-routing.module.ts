import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { ConverterComponent } from './rates/converter/converter.component';
import { CurrencyDetailsComponent } from './rates/currency-details/currency-details.component';
import { HomeComponent } from './rates/home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/rates', pathMatch: 'full' },
  { path: 'rates', component: HomeComponent },
  { path: 'converter', component: ConverterComponent },
  { path: ':currency', component: CurrencyDetailsComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
