import { Observable, Subject, combineLatest } from 'rxjs';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { UsersState } from '../+state/stores.reducer';
import { getUsersList } from '../+state/stores.selectors';
import { Paging } from 'src/app/api/types/Pageable';
import {
  LoadUsersPage,
  InviteUser,
  RemoveUserStoreAccess,
  ChangeAccountManager,
  PartialUpdateStore
} from '../+state/stores.actions';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { helpPage } from 'src/app/shared/help-page.const';
import { DeleteDialogData } from '../store-catalog/stores-catalog';
import { DeleteDialogComponent } from '../store-catalog/overlay/delete-dialog/delete-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { AccountService } from 'src/app/account/account.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custom.validators';

export interface DialogData {
  inviteeEmail: string;
  storeName: string;
  role: string;
}

@Component({
  selector: 'app-store-users',
  templateUrl: './store-users.component.html',
  styleUrls: ['./store-users.component.scss']
})
export class StoreUsersComponent implements OnInit, OnDestroy {
  users$: Observable<any>;
  storeId: number;
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  paramsSubscription: any;
  currentStore: string;
  destroyed$ = new Subject<void>();
  store$: Observable<any>;
  usersHelpPage = helpPage.users;
  isCurrUserSuperAdmin: boolean = false;
  loggedInUserData;
  users = [];
  allUsers = [];
  userForm: FormGroup;
  isCrmCompanyIdPresent: boolean = false;
  isCurrUserAccountManager: boolean = false;
  constructor(
    private store: Store<UsersState>,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private translate: TranslateService,
    private accountService: AccountService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.userForm = this.fb.group({
      selectedAccountManagerId: [0],
      crmCompanyId: ["", [CustomValidators.maxLength20DigitsValidator()]]
    });

    this.paramsSubscription = this.route.params
      .pipe(takeUntil(this.destroyed$))
      .subscribe(params => {
        this.storeId = params.id as number;
      });

    combineLatest([
      this.accountService.get(),
      this.store.pipe(select(getLoggedInUser))
    ])
      .subscribe(data => {
        this.loggedInUserData = data[0];
        this.isCurrUserSuperAdmin = data[1].superAdmin;
      })
    this.users$ = combineLatest([this.store.pipe(select(getUsersList)), this.store.pipe(select(getLoggedInUser))]);
    this.users$.subscribe(([userList, loggedInUser]) => {
      if (userList) {
        let accountManager = userList?.allUsers?.find(user => user.storeRole === "ACCOUNT_MANAGER");
        this.users = userList?.data;
        this.allUsers = userList?.allUsers
        if (accountManager) {
          if(this.users.find(user => user.id == accountManager.id)){
            this.users = userList?.data.filter(data => data.id !== accountManager.id);
          }
          this.allUsers = userList?.allUsers.filter(data => data.id !== accountManager.id);
          this.allUsers.push(accountManager);
          setTimeout(() => {
            this.accountManagerId.setValue(accountManager.id);
            this.accountManagerId.updateValueAndValidity();
          }, 0);
          if(loggedInUser && accountManager.id === loggedInUser.id){
            this.isCurrUserAccountManager = true;
          }
        }
      }
    })
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.currentStore = s.name;
      if(s.crmCompanyId){
        this.userForm.patchValue({"crmCompanyId" : s.crmCompanyId})
        this.isCrmCompanyIdPresent = true;
      }
    });
  }

  selectAccountManager(event$) {
    let val = Number(event$.target.value);
    if (this.accountManagerId.getRawValue() !== val) {
      this.store.dispatch(new ChangeAccountManager(this.storeId, val, { page: 0, size: 10 }))
    }
  }

  goToLink(event: Event) {
    event.stopPropagation();
  }

  crmCompanyIdHandler() {
    if(this.userForm.valid){
      this.store.dispatch(new PartialUpdateStore({crmCompanyId: this.crmCompanyId.getRawValue()}))
    }
  }

  paginate(paging: Paging) {
    this.store.dispatch(new LoadUsersPage(this.storeId, paging));
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(StoreInviteDialogComponent, {
      width: '450px',
      data: { storeName: this.currentStore + '', inviteeEmail: '', role: 'STORE_ADMIN' },
      panelClass: 'invite-user-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (this.validateInviteDialogSelection(result)) {
          this.invite(result);
        } else {
          this.toastr.error('Invalid Email Address', 'Invite failed!');
        }
      }
    });
  }

  private validateInviteDialogSelection(result: DialogData): boolean {
    return this.regexp.test(result.inviteeEmail.trim()) && !!result.role;
  }

  invite(result: DialogData) {
    this.store.dispatch(new InviteUser(result.inviteeEmail.trim(), result.role, this.storeId));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  removeUserStoreAcess(userId: number) {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.users.removeUser');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.store.dispatch(new RemoveUserStoreAccess(userId, this.storeId));
      }
    });
  }

  get accountManagerId() {
    return this.userForm.get('selectedAccountManagerId');
  }

  get crmCompanyId() {
    return this.userForm.get('crmCompanyId');
  }

}


@Component({
  selector: 'app-store-invite-dialog',
  templateUrl: 'store-invite-dialog.html'
})
export class StoreInviteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StoreInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  save(): void {
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
