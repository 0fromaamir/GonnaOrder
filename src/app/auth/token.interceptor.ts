import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, first, mergeMap, switchMap, take } from 'rxjs/operators';
import { LogoutSuccess, RefreshTokenSuccess } from './+state/auth.actions';
import { AuthState } from './+state/auth.reducer';
import { getTokens } from './+state/auth.selectors';
import { AuthService } from './auth.service';
import { addToken, isNonAuthEndpoint } from './token-helper';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public authService: AuthService, private router: Router, private store: Store<AuthState>) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.store.select(getTokens).pipe(
      first(),
      mergeMap(tokens => {
        if (isNonAuthEndpoint(request) ) {
          if (!!tokens && !!tokens.jwt) {
            request = addToken(request, tokens.jwt);
          }
          return next.handle(request).pipe(catchError(error => {
            if (!error.errors) { error.errors = []; }
            if (!!error.error && !error.error.errors) { error.error.errors = []; }
            if (error instanceof HttpErrorResponse && error.status === 401) {
              return this.handle401Error(request, next);
            } else {
              return throwError(error);
            }
          }));
        } else {
          return next.handle(request);
        }
      }
    ));

  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.authService.isRefreshingToken) {
      this.authService.isRefreshingToken = true;
      this.refreshTokenSubject.next(null);

      return this.store.select(getTokens).pipe(
        first(),
        mergeMap(tokens => {
          if (!!tokens.refreshToken) {
            return this.authService.refreshToken(tokens.refreshToken).pipe(
              switchMap((token: any) => {
                this.authService.isRefreshingToken = false;
                this.refreshTokenSubject.next(token.jwt);
                this.store.dispatch(new RefreshTokenSuccess(token));
                return next.handle(addToken(request, token.jwt));
              }),
              catchError(error => {
                if (!error.errors) { error.errors = []; }
                if (!!error.error && !error.error.errors) { error.error.errors = []; }
                this.authService.isRefreshingToken = false;
                if (error instanceof HttpErrorResponse && error.status === 401) {
                  this.store.dispatch(new LogoutSuccess({
                    src: "TokenInterceptor",
                    description: "401 error from refresh token"
                  }));
                  this.router.navigate(['/login']);
                }
                return throwError(error);
              }));
          } else {
              this.authService.isRefreshingToken = false;
              this.store.dispatch(new LogoutSuccess({
                src: "TokenInterceptor",
                description: "No refresh token"
              }));
              this.router.navigate(['/login']);
          }

        }));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(addToken(request, jwt));
        }));
    }
  }
}
