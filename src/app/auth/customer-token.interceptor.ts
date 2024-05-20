import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, first, mergeMap } from 'rxjs/operators';
import { CustomerAuthService } from '../public/customer-auth.service';
import { addToken } from './token-helper';

@Injectable()
export class CustomerTokenInterceptor implements HttpInterceptor {
  constructor(public customerAuthService: CustomerAuthService, private store: Store<any>) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.store.pipe(
      first(),
      mergeMap((state) => {
        const tokens = state?.socialLoginState?.socialLoginState?.tokens;
        if (!request.headers.has('Authorization')) {
          if (tokens?.jwt) {
            request = addToken(request, tokens.jwt);
          }
          return next.handle(request).pipe(
            // TODO - handle 401 error
            catchError((error) => {
              return throwError(error);
            })
          );
        } else {
          return next.handle(request);
        }
      })
    );
  }
}
