import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly error = signal<string>('');
  protected readonly loading = signal<boolean>(false);

  protected readonly form = this.fb.nonNullable.group({
    emailOrPhone: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.error.set('');
    this.loading.set(true);

    const value = this.form.getRawValue();

    const apiBaseUrl = this.auth.apiBaseUrl;

    this.api.login(apiBaseUrl, {
      emailOrPhone: value.emailOrPhone,
      password: value.password,
    }).subscribe({
      next: (response) => {
        this.auth.setSession({
          apiBaseUrl,
          adminSecret: response.adminSecret,
          token: response.token,
          userId: response.id,
          email: response.email,
        });
        void this.router.navigate(['/products']);
      },
      error: (e: unknown) => {
        const message = this.extractErrorMessage(e);
        this.error.set(message || 'Login failed');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  private extractErrorMessage(e: unknown): string {
    if (!e || typeof e !== 'object') return '';
    const anyError = e as { error?: unknown; message?: unknown };
    const body = anyError.error as { message?: unknown } | undefined;
    if (body && typeof body.message === 'string') return body.message;
    if (typeof anyError.message === 'string') return anyError.message;
    return '';
  }
}

