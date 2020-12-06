import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { ToastrModule } from 'ngx-toastr';
import { ChartsModule } from 'ng2-charts';

import { MaterialModule } from './app-material-design';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ToastrModule.forRoot(),
    ChartsModule
  ],
  exports: [
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToastrModule,
    ChartsModule
  ]
})
export class SharedModule { }
