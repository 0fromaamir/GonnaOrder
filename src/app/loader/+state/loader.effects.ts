import { Injectable } from '@angular/core';
import { Actions, createEffect } from '@ngrx/effects';
import { filter, map } from 'rxjs/operators';
import { ShowLoader, HideLoader } from './loader.actions';

@Injectable()
export class LoaderEffects {
  constructor(private actions$: Actions) { }

  
  showLoader$ = createEffect(() => this.actions$.pipe(
    filter((action: any) => action && action.showLoader),
    map((action: any) => new ShowLoader(action))
  ));

  
  hideLoader$ = createEffect(() => this.actions$.pipe(
    filter((action: any) => action && action.triggerAction),
    map((action: any) => new HideLoader(action))
  ));
}
