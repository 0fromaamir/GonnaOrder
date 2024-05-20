import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WindowRefService } from '../window.service';
import { GlobalErrorService } from './global-error.service';
import { HelperService } from '../public/helper.service';
import { WhitelabelService } from '../shared/whitelabel.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private windowRefSer: WindowRefService,
    private storeErrorSer: GlobalErrorService,
    private helper: HelperService,
    private whitelabelService: WhitelabelService
    ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req).pipe(
      catchError(error => {
        if (!error.errors) { error.errors = []; }
        if (!!error.error && !error.error.errors) { error.error.errors = []; }
        if (error instanceof HttpErrorResponse) {
          // Avoid redirect if 404
          const {path, method} = error.error;

          const avoidRedirect = [
            /^\/api\/v1\/stores\/.*\/orders\/.*/gm, // specific order
            /^\/api\/v1\/stores\/.*\/loyalty/gm,     // loyalty membership
            /^\/api\/v1\/auth\/.*/gm // auth
          ];

          if (error.status === 404 && avoidRedirect.some(pattern => path?.match(pattern))) {
            return throwError(error);
          }

          if (this.windowRefSer.nativeWindowLocation.hostname.startsWith('admin') || this.whitelabelService.isWhiteLabelDomain(this.windowRefSer.nativeWindowLocation.hostname)) {
            // Admin side
            const httpErrorStatus = (error as HttpErrorResponse).status;
            if (httpErrorStatus === 404 || httpErrorStatus === 500) {
              this.storeErrorSer.currentError = error;
              if (!this.helper.isMobileApp()) {
                this.router.navigate(['/manager/expectederror'], { skipLocationChange: true });
              }
            } else if (httpErrorStatus === 403) {
              this.storeErrorSer.isAccessDenied = true;
              if (!this.helper.isMobileApp()) {
                this.router.navigate(['/manager/expectederror'], { skipLocationChange: true });
              }
            }
            return throwError(error);
          }

          // TODO: check if 500 error handling is needed for public side
          switch ((error as HttpErrorResponse).status) {
            case 404:
            case 403:
              if (!this.helper.isMobileApp()) {
                this.router.navigate(['/not-found']);
              }
              return throwError(error);
            default:
              return throwError(error);
          }

        } else {
          return throwError(error);
        }
      })
    );
  }

}
