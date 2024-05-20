import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { HelperService } from './public/helper.service';

@Injectable({
  providedIn: 'root'
})
export class AppModeGuard {

  subdomain: string;
  constructor(
    private router: Router,
    private helperService: HelperService) { }

  canActivate(route: ActivatedRouteSnapshot) {
    if (this.helperService.isMobileApp()) {
      if (this.helperService.isGoAdminApp()) {
        this.router.navigate(['/manager']);
      } else {
        this.router.navigate(['/public']);
      }
      return false;
    } return true;
  }
}
