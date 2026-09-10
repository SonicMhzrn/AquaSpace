import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Prefixes relative API requests with environment.apiUrl.
 * While the app runs on mock/local data, environment.apiUrl is empty and
 * this interceptor is effectively a no-op. Once services are switched to
 * HttpClient calls (see README), this makes the swap seamless.
 */
export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.apiUrl || req.url.startsWith('http')) {
    return next(req);
  }
  const prefixed = req.clone({ url: `${environment.apiUrl}${req.url}` });
  return next(prefixed);
};
