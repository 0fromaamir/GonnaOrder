import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { LoggedInUser } from 'src/app/auth/auth';
import { helpPage } from 'src/app/shared/help-page.const';
import { StoreSubscriptionsService } from '../store-subscriptions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { getSelectedStore } from '../../+state/stores.selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { UpdatePrice } from '../+state/store-subscriptions.actions';
@Component({
  selector: 'app-update-pricing',
  templateUrl: './update-pricing.component.html',
  styleUrls: ['./update-pricing.component.scss']
})
export class UpdatePricingComponent implements OnInit, OnDestroy {

  updatePricingForm: FormGroup;
  updatePricingHelpPage = helpPage.subscription;
  form: FormGroup;
  loggedInUser$: Observable<LoggedInUser>;
  storeId: number;
  private destroy$ = new Subject();
  subscriptionCurrency: string;

  constructor(
    private toastr: ToastrService,
    private store: Store,
    private storeSubscriptionService: StoreSubscriptionsService,
    private actRoute: ActivatedRoute,
    private router: Router,
  ) {

    this.updatePricingForm = new FormGroup({
      orderFixed: new FormControl(),
      orderPercentageFee: new FormControl(),
      paymentFixed: new FormControl(),
      paymentPercentageFee: new FormControl(),
      monthlySubscription: new FormControl(),
      yearlySubscription: new FormControl(),
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getControl(name: string) {
    return this.updatePricingForm?.get(name);
  }

  ngOnInit(): void {
    this.loggedInUser$ = this.store.pipe(select(getLoggedInUser));
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.storeId = data.id;
      this.subscriptionCurrency = data.address.country.subscriptionCurrency
      this.updatePricingForm.patchValue({
        orderFixed: data.platformOrderFee,
        orderPercentageFee: data.platformOrderPercentageFee,
        paymentFixed: data.platformPaymentFee,
        paymentPercentageFee: data.platformPaymentPercentageFee,
        monthlySubscription: data.subscriptionPrice1Month,
        yearlySubscription: data.subscriptionPrice1Year,
      })
    });
  }

  updatePrice() {
    let body = {
      subscriptionPrice1Month: this.updatePricingForm.getRawValue().monthlySubscription,
      subscriptionPrice1Year: this.updatePricingForm.getRawValue().yearlySubscription,
      platformOrderFee: this.updatePricingForm.getRawValue().orderFixed,
      platformOrderPercentageFee: this.updatePricingForm.getRawValue().orderPercentageFee,
      platformPaymentFee: this.updatePricingForm.getRawValue().paymentFixed,
      platformPaymentPercentageFee: this.updatePricingForm.getRawValue().paymentPercentageFee,
    }
    this.store.dispatch(new UpdatePrice(this.storeId, body));
  }
}
