import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { CustomerAuthService } from 'src/app/public/customer-auth.service';
import { HelperService } from 'src/app/public/helper.service';
import { LocationService } from 'src/app/public/location.service';
import { ClientStore } from 'src/app/stores/stores';
import {
  AddCheckoutState,
  AddOrderMeta,
  CustomerDetailsUpdate
} from '../../+state/stores.actions';
import { Cart, CustomerDetailsUpdateState, SocialLoginState } from '../../+state/stores.reducer';
import {
  getCurrentOrderMetaState,
  getCustomerDetailsUpdate,
  getCustomerInfo,
  getSelectedStore,
  getSocialAuth,
  getTokens
} from '../../+state/stores.selectors';
import { CustomValidators } from '../../../../shared/custom.validators';
import { CustomerDetailsUpdateRequest } from '../../types/CustomerSocialLogin';
import { CheckoutService } from '../checkout.service';
import { OrderingSetting } from 'src/app/stores/+state/stores.reducer';

@Component({
  selector: 'app-store-checkout-selfpickup',
  templateUrl: './store-checkout-selfpickup.component.html',
  styleUrls: ['./store-checkout-selfpickup.component.scss'],
})
export class StoreCheckoutSelfPickupComponent implements OnInit, OnDestroy {
  personalInfoForm: FormGroup;
  selectedStore: ClientStore;
  unsubscribe$: Subject<void> = new Subject<void>();
  customerDetailsUpdateStatus = 'INITIAL';
  socialLoginState: SocialLoginState;
  customerDetailsUpdateState: CustomerDetailsUpdateState;
  isAdminOrderCaptureUpdate: boolean;

  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    public checkoutService: CheckoutService,
    public helper: HelperService,
    public auth: CustomerAuthService,
    private locationService: LocationService
  ) { }

  ngOnInit() {
    this.isAdminOrderCaptureUpdate = this.locationService.isAdminOrderCaptureUpdate();

    this.store
      .select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => {
        if (d) {
          this.selectedStore = d;
          this.updateValidationRules();
        }
      });

    this.store
      .select(getCurrentOrderMetaState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((d) => {
        if (d) {
          this.updateOrderMetaDataValues();
        }
      });

    this.store
      .select(getSocialAuth)
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((state) => state?.socialLoginState?.socialAuthStatus === 'SUCCESS')
      )
      .subscribe((state) => {
        this.socialLoginState = state.socialLoginState;
        this.setCustomerDetails(state.socialLoginState);
        this.customerDetailsUpdateStatus = 'INITIAL';
      });

    this.store
      .select(getCustomerDetailsUpdate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((state) => {
        const customerDetailsUpdateResponse = state.customerDetailsUpdateState;
        if (customerDetailsUpdateResponse) {
          this.customerDetailsUpdateStatus = customerDetailsUpdateResponse.customerDetailsUpdateStatus;
          if (this.customerDetailsUpdateStatus === 'SUCCESS') {
            this.customerDetailsUpdateState = customerDetailsUpdateResponse;
          }
        }
      });

    if (this.isAdminOrderCaptureUpdate) {
      this.store
        .select(getCustomerInfo)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((state) => {
          if (state) {
            const { name, email, phone } = state;
            if (email) {
              if (this.getControl('email')) {
                this.getControl('email').patchValue(email, { onlySelf: true, emitEvent: true });
                this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
              }
            }
            if (phone) {
              if (this.getControl('phone')) {
                this.getControl('phone').patchValue(phone, { onlySelf: true, emitEvent: true });
                this.addOrderMeta('customerPhoneNumber', 'phone', 'personalInfoForm');
              }
            }
          }
        });
    }
  } // EOF: ngOnInit

  setCustomerDetails(response) {
    if (response.email && this.getControl('email') && !this.emailFieldHidden()) {
      this.getControl('email').patchValue(response.email, { onlySelf: true, emitEvent: true });
      this.addOrderMeta('customerEmail', 'email', 'personalInfoForm');
    }
    if (response.phoneNumber && this.getControl('phone') && !this.phoneFieldHidden()) {
      this.getControl('phone').patchValue(response.phoneNumber, { onlySelf: true, emitEvent: true });
      this.addOrderMeta('customerPhoneNumber', 'phone', 'personalInfoForm');
    }
  }


  updateValidationRules() {
    let nameValidators = [Validators.maxLength(200)];
    if (this.nameFieldRequired()) {
      nameValidators.push(Validators.required);
    }

    let emailValidators = [CustomValidators.email, Validators.maxLength(200)];
    if (this.emailFieldRequired()) {
      emailValidators.push(Validators.required);
    }

    this.personalInfoForm = this.fb.group({
      name: [this.checkoutService.getOrderMetaData('customerName'), { validators: nameValidators, updateOn: 'change' }],
      email: [this.checkoutService.getOrderMetaData('customerEmail'), { validators: emailValidators, updateOn: 'change' }],
      phone: [this.checkoutService.getOrderMetaData('customerPhoneNumber'), { updateOn: 'change' }],
    });
    this.personalInfoForm.updateValueAndValidity();
    this.checkFormValidity('Update validation rules');
    this.getControl('name').markAsDirty();
    this.getControl('email').markAsDirty();
    this.getControl('phone').markAsDirty();
  }

  updateOrderMetaDataValues() {
    this.updateValues('name', 'customerName');
    this.updateValues('email', 'customerEmail');
    this.updateValues('phone', 'customerPhoneNumber');
    this.checkFormValidity('Update order meta data values');
  }

  updateValues(control: string, meta: string) {
    if (this.getControl(control).value !== this.checkoutService.getOrderMetaData(meta)) {
      this.getControl(control).patchValue(this.checkoutService.getOrderMetaData(meta));
    }
  }

  getControl(name: string, form: string = 'personalInfoForm') {
    return this[form]?.get(name) || null;
  }

  checkFormValidity(description?: string) {
    this.store.dispatch(
      new AddCheckoutState('personalFormValid', this.personalInfoForm.valid, {
        src: 'StoreCheckoutSelfPickupComponent',
        description,
      })
    );
  }

  addOrderMeta(metaKey: string, control: any, formGroup = 'personalInfoForm') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  nameFieldHidden() {
    return this.selectedStore.settings.PICKUP_NAME_SELECTION === OrderingSetting.HIDDEN;
  }

  emailFieldHidden() {
    return this.selectedStore.settings.PICKUP_EMAIL_SELECTION === OrderingSetting.HIDDEN;
  }

  phoneFieldHidden() {
    return this.selectedStore.settings.PICKUP_TEL_SELECTION === OrderingSetting.HIDDEN;
  }

  nameFieldRequired() {
    return this.selectedStore.settings.PICKUP_NAME_SELECTION === OrderingSetting.MANDATORY;
  }

  emailFieldRequired() {
    return (
      !this.isAdminOrderCaptureUpdate &&
      this.selectedStore.settings.PICKUP_EMAIL_SELECTION === OrderingSetting.MANDATORY
    );
  }

  phoneFieldRequired() {
    return this.selectedStore.settings.PICKUP_TEL_SELECTION === OrderingSetting.MANDATORY;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  customerDetailsChanged(): boolean {
    const state = this.customerDetailsUpdateState ?? this.socialLoginState;
    if (!state) {
      return false;
    }

    const fields = [];
    const stateFields = [];

    if (!this.nameFieldHidden()) {
      fields.push('name');
      stateFields.push('userName');
    }

    if (!this.phoneFieldHidden()) {
      fields.push('phone');
      stateFields.push('phoneNumber');
    }

    const changed = fields.some((field, index) => state[stateFields[index]] && this.getControl(field)?.value !== state[stateFields[index]]);

    if (changed) {
      this.customerDetailsUpdateStatus = 'INITIAL';
    }
    return changed;
  }

  updateCustomerDetails() {
    this.store
      .select(getTokens)
      .pipe(take(1))
      .subscribe((tokens) => {
        const tokenPair = !!tokens.jwt ? tokens : null;

        const customerDetails: CustomerDetailsUpdateRequest = {
          tokens: tokenPair
        };

        if (!this.nameFieldHidden()) {
          customerDetails.userName = this.getControl('name')?.value;
        }

        if (!this.phoneFieldHidden()) {
          customerDetails.phoneNumber = this.getControl('phone')?.value;
        }

        this.store.dispatch(new CustomerDetailsUpdate(customerDetails));
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  countryCode() {
    return this.selectedStore?.address?.country?.phoneCode;
  }
}
