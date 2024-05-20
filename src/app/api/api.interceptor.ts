import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HelperService } from '../public/helper.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(private helper: HelperService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    let requestUrl = request.url;
    // if the request URL have the string prefix, 
    // then make the replace by the correct url
    if (this.helper.isMobileApp()) {
      if (requestUrl.indexOf('/api/') !== -1) {
        requestUrl = environment.backend.baseURL + requestUrl; 
      } else if (requestUrl.indexOf('api/') !== -1) {
        requestUrl = environment.backend.baseURL + '/' + requestUrl; 
      }
    }
    // clone the http request
    request = request.clone({
      url: requestUrl
    });
    // move to next HttpClient request life cycle
    return next.handle(request);
  }


}
