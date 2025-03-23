import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PasswordModule } from 'primeng/password';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEye,
  faEyeSlash,
  faKey,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    PasswordModule,
    FontAwesomeModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  faUser = faUser;
  faKey = faKey;
  faEyeSlash = faEyeSlash;
  faEye = faEye;
  loginForm: FormGroup;
  loading: boolean = false;
  isPasswordVisible = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService, // private fcToastService: FcToastService
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {}
  get loginFormControl() {
    return this.loginForm.controls;
  }
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  submit() {
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Login Berhasil',
            detail: 'Selamat datang!',
          });
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Gagal',
          detail: err.message || 'Cek kembali username dan password!',
        });
        this.loading = false;
      },
    });
  }
}
