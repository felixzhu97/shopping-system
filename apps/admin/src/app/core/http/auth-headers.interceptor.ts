import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';

export const authHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  let updated = req;

  if (auth.token) {
    updated = updated.clone({
      setHeaders: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
  }

  if (auth.adminSecret) {
    updated = updated.clone({
      setHeaders: {
        'admin-secret': auth.adminSecret,
      },
    });
  }

  return next(updated);
};

