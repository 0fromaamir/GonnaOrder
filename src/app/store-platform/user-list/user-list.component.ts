import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { DeleteDialogComponent } from 'src/app/stores/store-catalog/overlay/delete-dialog/delete-dialog.component';
import { DeleteDialogData } from 'src/app/stores/store-catalog/stores-catalog';
import { InviteTenantUser, RevokeTenantUserAccess } from '../+state/platform.actions';
import { getTenantUsersList } from '../+state/platform.selectors';
import { DialogComponent, DialogData } from 'src/app/shared/dialog/dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  tenantUsers$: Observable<any>;
  tenantUsers = [];
  tenantCode: string;
  regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  constructor(public dialog: MatDialog, private toastr: ToastrService, private translate: TranslateService, private route: ActivatedRoute, private store: Store<any>){}
  ngOnInit() {
    this.route.params
    .pipe(
      switchMap(params => {
        this.tenantCode = params.tenantCode;
        return of(this.tenantCode);
      }),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.tenantUsers$ = this.store.pipe(select(getTenantUsersList));
      this.tenantUsers$.subscribe((userList) => {
        if (userList.status === 'LOADED') {
          this.tenantUsers = userList?.data;
        }
      })
    })
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px',
      data: { inviteeEmail: '', dialogTitle: 'Add tenant admin user', dialogDiscription: 'Add an existing user as tenant admin'},
      // panelClass: 'invite-user-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (this.validateAddTenantAdminDialogSelection(result)) {
          this.store.dispatch(new InviteTenantUser(result.inviteeEmail.trim(), this.tenantCode));
        } else {
          this.toastr.error('Invalid Email Address', 'Invite failed!');
        }
      } 
    });
  }
  

  private validateAddTenantAdminDialogSelection(result: DialogData): boolean {
    return this.regexp.test(result.inviteeEmail.trim());
  }

  removeUserStoreAcess(userId: number) {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = "Are you sure you want to remove the tenant admin access for this user?<br/>This action cannot be undone.";
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.store.dispatch(new RevokeTenantUserAccess(userId, this.tenantCode));
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}