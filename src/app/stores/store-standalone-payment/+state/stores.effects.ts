import { Router } from '@angular/router';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { AdminStandalonePaymentSearch, AdminStandalonePaymentSearchFailed, AdminStandalonePaymentSearchSuccess, StoreActionType } from './stores.actions';
import { StandalonePaymentService } from '../standalone-payment.service';

@Injectable()
export class StoreStandalonePaymentEffects {

  constructor(
    private actions$: Actions,
    private standalonePaymentService: StandalonePaymentService
    ) { }

    
    onAdminStandalonePaymentSearch = createEffect(() => this.actions$.pipe(
      ofType<AdminStandalonePaymentSearch>(StoreActionType.AdminStandalonePaymentSearch),
      switchMap((action) => {
        const standaloneRequest: any = {
          locationId: action.locationId,
          customerName: action.customerName,
          openTap: action.tapId
        };
        return this.standalonePaymentService.adminStandalonePaymentSearch(action.storeId, standaloneRequest, action.paging).pipe(
          map(s => new AdminStandalonePaymentSearchSuccess(s)),
          catchError((err) => of(new AdminStandalonePaymentSearchFailed()))
        );
      })
    ));
}
