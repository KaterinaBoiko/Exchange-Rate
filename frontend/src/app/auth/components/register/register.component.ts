import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();

  registerForm: FormGroup;

  get username(): AbstractControl {
    return this.registerForm.get('username');
  }

  get email(): AbstractControl {
    return this.registerForm.get('email');
  }

  get password(): AbstractControl {
    return this.registerForm.get('password');
  }

  get repeatPassword(): AbstractControl {
    return this.registerForm.get('repeatPassword');
  }

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group({
      username: [''],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', Validators.required]
    },
      {
        validator: this.passwordMatchValidator
      });
  }

  registerUser(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      delete this.registerForm.value.repeatPassword;
      this.authService.register(this.registerForm.value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          response => {
            this.showSuccess('User was created');
            this.router.navigate(['/login']);
          },
          error => {
            console.log(error);
            this.showError(error.error?.message || error.message);
          }
        );
    }
  }

  private passwordMatchValidator(control: AbstractControl): void {
    const password: string = control.get('password').value;
    const repeatPassword: string = control.get('repeatPassword').value;

    if (password !== repeatPassword) {
      control.get('repeatPassword').setErrors({ passwordMismatch: true });
    }
    else {
      control.get('repeatPassword').setErrors({ passwordMismatch: null });
      control.get('repeatPassword').updateValueAndValidity({ onlySelf: true });
    }
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success');
  }

  showError(error: string) {
    this.toastr.error(error, 'Error');
  }

}
