import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { getLoggedInUser } from '../auth/+state/auth.selectors';

import { filter, map } from 'rxjs/operators';
import {select, Store} from '@ngrx/store';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatformNavigationGuard {
  constructor(private store: Store<any>, private router: Router) { }

  canActivateChild(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.store.pipe(
      select(getLoggedInUser),
      filter(loggedInUser => loggedInUser.id !== -1),
      map(loggedInUser => {
        return loggedInUser.platformAdmin;
      })
    );
  }
}
