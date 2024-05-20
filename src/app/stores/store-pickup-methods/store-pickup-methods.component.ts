import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings } from '../+state/stores.actions';
import { StoresState } from '../+state/stores.reducer';

@Component({
  selector: 'app-store-pickup-methods',
  templateUrl: './store-pickup-methods.component.html',
  styleUrls: ['./store-pickup-methods.component.scss']
})
export class StorePickupMethodsComponent implements OnInit, OnDestroy {
  settingsForm: FormGroup = this.fb.group({});
  destroyed$ = new Subject<void>();
  helpUrl: string;

  constructor(private fb: FormBuilder, private store: Store<StoresState>) {
  }

  ngOnInit() {
    this.helpUrl = 'displayPickupAddress';
    this.settingsForm = this.fb.group({
      PICKUP_EMAIL_SELECTION: [''],
      PICKUP_TEL_SELECTION: [''],
      PICKUP_NAME_SELECTION: [''],
      DELIVERY_NO_LOCATION_SHOW_ADDRESS: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.settingsForm.get('DELIVERY_NO_LOCATION_SHOW_ADDRESS').setValue(s.settings.DELIVERY_NO_LOCATION_SHOW_ADDRESS);
      this.settingsForm.get('PICKUP_EMAIL_SELECTION').setValue(s.settings.PICKUP_EMAIL_SELECTION);
      this.settingsForm.get('PICKUP_TEL_SELECTION').setValue(s.settings.PICKUP_TEL_SELECTION);
      this.settingsForm.get('PICKUP_NAME_SELECTION').setValue(s.settings.PICKUP_NAME_SELECTION);
    });

  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit() {
    const formObj = this.settingsForm.getRawValue();
    this.settingsForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }
}
