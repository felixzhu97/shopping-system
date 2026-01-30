import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated) return true;
  return inject(Router).createUrlTree(['/login']);
};

