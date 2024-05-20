import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { getTenantsList } from '../+state/platform.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Tenant } from '../platform';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-platform-list',
  templateUrl: './platform-list.component.html',
  styleUrls: ['./platform-list.component.scss']
})
export class PlatformListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  tenantsList: Tenant[] = [];
  environment = environment.name === 'local' ? environment.envDomain + ':' + window.location.port : environment.envDomain;
  protocol = window.location.protocol;

  constructor(private store: Store<any>, private router: Router){}
  ngOnInit() {
    this.store.pipe(
      select(getTenantsList),
      takeUntil(this.destroy$),
    ).subscribe(s => {
      this.tenantsList = s;
    });
  }

  isButtonActive(){
    const currentUrl = this.router.url;
    const parts = currentUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return (lastPart === 'tenants' ) ? true : false;
  }

  addTenantHandler() {
    this.router.navigate([`/manager/platform/tenant/createTenant`]);
  }

  editTenantHandler(tenantCode: string) {
    this.router.navigate([`/manager/platform/tenant/${tenantCode}`]);
  }

  userDetailsHandler(tenantCode: string) {
    this.router.navigate([`/manager/platform/tenant/${tenantCode}/users`]);
  }

  goToLink(event: Event) {
    event.stopPropagation();
  }

  copyTitleURL(elementId: string) {
    let text = document.getElementById(elementId)?.innerHTML;
    if (text) {
      navigator.clipboard.writeText(text);
    }
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
