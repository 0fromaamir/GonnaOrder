import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {AccountState} from '../account/+state/account.reducer';
import {GetUser} from '../account/+state/account.actions';

@Injectable({
  providedIn: 'root'
})
export class UserGuard {

  constructor(private store: Store<AccountState>) { }

  canActivate() {
    this.store.dispatch(new GetUser());
    return true;
  }
}
