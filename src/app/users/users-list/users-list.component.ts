import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Paging } from 'src/app/api/types/Pageable';
import { UsersState } from '../+state/users.reducer';
import { getUsersList } from '../+state/users.selectors';
import { LoadUsers, SearchUser } from '../+state/users.actions';
import { ClientUser } from '../users';
import { DayType, Utils } from 'src/app/stores/utils/Utils';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { getProfile } from 'src/app/account/+state/account.selectors';
import { ClientStore } from 'src/app/stores/stores';

const ValidateEmail = (mail) => {
  return !!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail));
};

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  users$: Observable<any>;
  users: any;
  store$: Observable<ClientStore>;
  private destroy$ = new Subject();
  locale: string;
  timezone: string;
  email: string;
  emailInvalid = false;
  isJapanese = false;
  storeLocaleTimeZone$: Observable<{ locale: string; timezone: string; }>;

  constructor(private store: Store<UsersState>, private router: Router) { }

  ngOnInit() {
    this.users$ = this.store.pipe(select(getUsersList));
    this.users$.subscribe((users) => {
      this.users = users;
    });
    this.storeLocaleTimeZone$ = this.store.pipe(
      select(getSelectedStore),
      filter(s => s.id > 0),
      map(s => ({
        locale: s.address.country.defaultLocale + '-' + s.address.country.code,
        timezone: s.timeZone
      }))
    );
    this.storeLocaleTimeZone$.subscribe((timezone) => {
      this.isJapanese = (timezone.locale === 'ja-JP');
    });
    combineLatest([
      this.store.select(getSelectedStore),
      this.store.select(getProfile)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([state, loggedInUser]) => {
        if (state && loggedInUser) {
          if (state.id > 0 && state?.address?.country) {
            this.locale = state.address.country.defaultLocale + '-' + state.address.country.code;
            this.timezone = state.timeZone;
          } else if (loggedInUser?.country?.defaultLocale) {
            this.locale = loggedInUser.country.defaultLocale + '-' + loggedInUser.country.code;
            this.timezone = loggedInUser.country.defaultTimeZone;
          }
        }
      });
  }

  paginate(paging: Paging) {
    this.store.dispatch(new LoadUsers(paging));
  }

  goToUserPage(user: ClientUser) {
    if (user.id > 0) {
      this.router.navigate(['/manager/users/', user.id]);
    }
  }

  validateEmail(event) {
    this.emailInvalid = event.target.value.length !== 0 && !ValidateEmail(event.target.value);
    if (event.target.value.length === 0 && this.users.paging.size === -1) {
      this.store.dispatch(new LoadUsers({
        page: 0,
        size: 10
      }));
    }
  }

  dayCheck(inputDateStr: string) {
    return Utils.dayCheck(inputDateStr);
  }

  get DayType(): typeof DayType {
    return DayType;
  }
  searchUser() {
    if (this.email) {
      if (ValidateEmail(this.email)) {
        this.store.dispatch(new SearchUser(this.email));
      }
    } else {
      this.store.dispatch(new LoadUsers({
        page: 0,
        size: 10
      }));
    }
  }
}
