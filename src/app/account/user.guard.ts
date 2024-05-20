import { GetUser } from './+state/account.actions';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AccountState } from './+state/account.reducer';

@Injectable()
export class UserGuard {

  constructor(private store: Store<AccountState>) { }

  canActivate() {
    this.store.dispatch(new GetUser());
    return true;
  }
}
