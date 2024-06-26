import { getUpdateStatus, getProfile, getUpdateErrors } from '../+state/account.selectors';
import { UserProfile } from '../../api/types/User';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AccountState } from '../+state/account.reducer';
import { Store, select } from '@ngrx/store';
import { UpdateUser } from '../+state/account.actions';
import { Observable } from 'rxjs';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss']
})
export class ProfileUpdateComponent implements OnInit {
  status$: Observable<string>;
  errors$: Observable<string[]>;
  profile$: Observable<UserProfile>;
  isSuperAdmin: boolean;

  constructor(private store: Store<AccountState>) { }

  ngOnInit() {
    this.status$ = this.store.pipe(
      select(getUpdateStatus)
    );

    this.errors$ = this.store.pipe(
      select(getUpdateErrors)
    );

    this.profile$ = this.store.pipe(
      select(getProfile)
    );

    this.store.pipe(
      select(getLoggedInUser)
    ).subscribe((loggedInUser) => {
      this.isSuperAdmin = loggedInUser.superAdmin
    })

  }

  updateAction(user: UserProfile) {
    this.store.dispatch(new UpdateUser(user));
  }

}
