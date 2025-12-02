import { HttpInterceptorFn } from '@angular/common/http';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('Token');

  
  if (!token || req.url.includes('/auth/')) {
    return next(req);
  }

  // Format: "Bearer <token>" is the standard JWT auth header format
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
