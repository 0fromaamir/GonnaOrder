import { CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, tap, map } from 'rxjs/operators';
import { UserState } from '../user/+state/user.reducer';

@Injectable({
  providedIn: 'root'
})
export class PrintersListGuard implements CanActivate {

  constructor(private stores: Store<any>, private userStore: Store<UserState>) { }

  canActivate() {
      return true;
  }
}
