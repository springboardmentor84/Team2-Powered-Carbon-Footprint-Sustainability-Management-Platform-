import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const possibleTokenKeys = [
    'token',
    'TOKEN_KEY',
    'authToken',
    'accessToken',
    'jwt',
    'jwtToken'
  ];

  let token: string | null = null;

  for (const key of possibleTokenKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      token = value;
      break;
    }
  }

  if (!token) {
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest);
};
