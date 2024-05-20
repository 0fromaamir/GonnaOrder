import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { getSelectedStore } from '../../+state/stores.selectors';

@Component({
  selector: 'app-store-integrations-flex-delivery',
  templateUrl: './store-integrations-flex-delivery.component.html',
  styleUrls: ['./store-integrations-flex-delivery.component.scss']
})
export class StoreIntegrationsFlexDeliveryComponent implements OnInit {
  section = 'flexDashboard';
  form: FormGroup;
  destroyed$ = new Subject<void>();
  helpUrl: string;

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'flexDelivery',
      this.form = this.fb.group({
        FLEXDELIVERY_CONNECT_ID: ['', [Validators.required, this.noWhitespace]],
        FLEXDELIVERY_COMPANY: ['', [Validators.required, this.noWhitespace]],
        FLEXDELIVERY_ENABLED: ['',]
      });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.FLEXDELIVERY_CONNECT_ID != null) {
        this.section = 'flexConnected';
      }
      this.form.get('FLEXDELIVERY_CONNECT_ID').setValue(s.settings.FLEXDELIVERY_CONNECT_ID);
      this.form.get('FLEXDELIVERY_COMPANY').setValue(s.settings.FLEXDELIVERY_COMPANY);
      this.form.get('FLEXDELIVERY_ENABLED').setValue(s.settings.FLEXDELIVERY_ENABLED);
    });
  }

  getControl(name: string) {
    return this.form.get(name);
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  connectToFlexDelivery(): void {
    const data = this.form.getRawValue();
    data.FLEXDELIVERY_ENABLED = true;
    this.store.dispatch(new UpdateStoreSettings(data));
    this.section = 'flexConnected';
  }

  toggleFlexDelivery(): void {
    const data = this.form.get('FLEXDELIVERY_ENABLED').value;
    this.store.dispatch(new UpdateStoreSettings({ FLEXDELIVERY_ENABLED: data }));
  }

  disconnectFlexDelivery(): void {
    this.store.dispatch(new UpdateStoreSettings({
      FLEXDELIVERY_CONNECT_ID: null,
      FLEXDELIVERY_COMPANY: null,
      FLEXDELIVERY_ENABLED: null
    }));
    this.section = 'flexDashboard';
  }
}
