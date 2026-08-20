import { HttpInterceptorFn } from '@angular/common/http';

import { TOKEN_KEY } from '../constants/app.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Do not attach an old token to login/signup requests
  if (
    req.url.includes('/api/v1/auth/login') ||
    req.url.includes('/api/v1/auth/signup')
  ) {
    return next(req);
  }

  let token = localStorage.getItem(TOKEN_KEY);

  if (!token) {

    console.warn(
      '[AUTH INTERCEPTOR] No JWT token found for:',
      req.url
    );

    return next(req);
  }

  // Remove Bearer if it was accidentally stored with the token
  token = token
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!token) {
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log(
    '[AUTH INTERCEPTOR] JWT attached:',
    req.method,
    req.url
  );

  return next(clonedRequest);
};
