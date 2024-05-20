import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {select, Store} from "@ngrx/store";
import {StoresState} from "../../+state/stores.reducer";
import {getSelectedStore} from "../../+state/stores.selectors";
import {filter, takeUntil} from "rxjs/operators";
import {
  ConnectHobex,
  DisconnectHobex
} from "../+state/payment.actions";
import {UpdateStoreSettings} from "../../+state/stores.actions";

@Component({
  selector: 'app-store-payment-hobex',
  templateUrl: './store-payment-hobex.component.html',
  styleUrls: ['./store-payment-hobex.component.scss']
})
export class StorePaymentHobexComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  private destroy$ = new Subject();
  public hobexForm: FormGroup;
  public hobexEnabled: boolean;
  public hobexConnected: boolean;
  public hobexAccessToken: string;
  public hobexEntityId: string;
  helpUrl: string;

  constructor(private store: Store<StoresState>, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.helpUrl = 'hobex';
    this.hobexForm = this.fb.group({
      HOBEX_ENTITY_ID: ['', [Validators.required, Validators.maxLength(255), this.noWhitespace]],
      HOBEX_ACCESS_TOKEN: ['', Validators.compose([Validators.required, Validators.maxLength(255)])]
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.settings.HOBEX_ENTITY_ID && s.settings.HOBEX_ACCESS_TOKEN) {
        this.hobexForm.patchValue(s.settings, {emitEvent: false});
        this.hobexConnected = true;
        this.hobexEntityId = s.settings.HOBEX_ENTITY_ID;
        this.hobexAccessToken = s.settings.HOBEX_ACCESS_TOKEN;
        this.hobexEnabled = s.settings.PAYMENT_HOBEX_CREDIT_CARD_ENABLED;
      } else {
        this.hobexConnected = false;
        this.hobexEnabled = false;
        this.hobexEntityId = ''
        this.hobexAccessToken = '';
      }
    });

    // tslint:disable
    this.hobexForm.valueChanges.subscribe(v => {
      if (!v.HOBEX_ENTITY_ID.trim() &&
        !v.HOBEX_ACCESS_TOKEN.trim() &&
        !this.hobexConnected
      ) {
        this.hobexEnabled = false;
        this.toggleHobexPayments(false);
      }
    });
    // tslint:enable
  }

  onFygaroClicked() {
    this.showFields = true;
  }

  connect() {
    this.hobexForm.markAllAsTouched();
    const formData = this.hobexForm.getRawValue();
    if (
      this.hobexForm.valid &&
      formData.HOBEX_ENTITY_ID.trim() &&
      formData.HOBEX_ACCESS_TOKEN.trim()
    ) {
      this.store.dispatch(new ConnectHobex({
        entityId: formData.HOBEX_ENTITY_ID,
        accessToken: formData.HOBEX_ACCESS_TOKEN,
      }));
    }
  }

  // tslint:disable
  disconnect() {
    this.store.dispatch(new DisconnectHobex());
  }

  // tslint:enable


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.hobexForm.get(name);
  }

  toggleHobexPayments(e) {
    if (this.hobexForm.controls.HOBEX_ENTITY_ID.value.trim().length === 0
      && this.hobexForm.controls.HOBEX_ACCESS_TOKEN.value.trim().length === 0
      && e) {
      setTimeout(() => {
        this.hobexEnabled = false;
      });
      return;
    }
    if (this.hobexForm.valid) {
      const formData = this.hobexForm.getRawValue();
      this.store.dispatch(new UpdateStoreSettings({PAYMENT_HOBEX_CREDIT_CARD_ENABLED: e, ...formData}));
    } else {
      setTimeout(() => {
        this.hobexEnabled = false;
      });

    }
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }
}
