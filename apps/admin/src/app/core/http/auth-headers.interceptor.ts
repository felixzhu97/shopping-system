import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';

const TRANSLATE_HOSTS = ['libretranslate.com', 'mymemory.translated.net'];

function isExternalTranslateUrl(url: string): boolean {
  try {
    const h = new URL(url, 'http://x').hostname;
    return TRANSLATE_HOSTS.some((host) => h === host || h.endsWith('.' + host));
  } catch {
    return false;
  }
}

export const authHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  if (isExternalTranslateUrl(req.url)) {
    return next(req);
  }

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

