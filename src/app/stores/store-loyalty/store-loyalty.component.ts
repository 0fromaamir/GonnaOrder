import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PartialUpdateStore, UpdateStoreSettings } from '../+state/stores.actions';
import { StoresState } from '../+state/stores.reducer';
import { getSelectedStore } from '../+state/stores.selectors';
import { DeleteDialogData } from '../store-catalog/stores-catalog';
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from '../store-catalog/overlay/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ClientStore } from '../stores';
import { getDiscountVoucherList } from '../store-discountvoucher/+state/store-discountvoucher.selectors';
import { DiscountVoucherState } from '../store-discountvoucher/+state/store-discountvoucher.reducer';


@Component({
  selector: 'app-store-loyalty',
  templateUrl: './store-loyalty.component.html',
  styleUrls: ['./store-loyalty.component.scss']
})
export class StoreLoyaltyComponent implements OnInit, OnDestroy {

  public showFields: boolean;
  private destroy$ = new Subject();
  public loyaltyForm: FormGroup;
  public loyaltyEnabled = false;
  helpUrl: string;
  LOYALTY_AMOUNT_REWARD: any;
  LOYALTY_AMOUNT_SPENT: any;
  loyaltyAmountSpent: any;
  loyaltyAmountReward: any;
  currency: any;
  voucherList = [];
  voucherId: null | number = null;

  constructor(private store: Store<StoresState>, private fb: FormBuilder, private translate: TranslateService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loyaltyForm = this.fb.group({
      LOYALTY_AMOUNT_SPENT: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      LOYALTY_AMOUNT_REWARD: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      LOYALTY_SCHEME: [''],
      voucherId: [null]
    });
    combineLatest([
      this.store.pipe(select(getDiscountVoucherList)),
      this.store.pipe(
        select(getSelectedStore),
        filter(s => s && s.id !== -1)
      )
    ]).subscribe(([voucherData, selectedStore]) => {
      if (voucherData && selectedStore) {
        this.voucherList = voucherData.data;
        this.currency = selectedStore.currency;
        if (selectedStore.settings.LOYALTY_SCHEME && selectedStore.settings.LOYALTY_SCHEME === 'AMOUNT_SPENT_AMOUNT_REWARD_WALLET') {
          this.loyaltyEnabled = true;
          this.loyaltyForm.patchValue(selectedStore.settings, { emitEvent: false });
          this.loyaltyAmountSpent = selectedStore.settings.LOYALTY_AMOUNT_SPENT;
          this.loyaltyAmountReward = selectedStore.settings.LOYALTY_AMOUNT_REWARD;
        } else { 
          this.loyaltyEnabled = false;
        }
        if(selectedStore.firstLoginVoucherId){
          setTimeout(() => {
            this.loyaltyForm.patchValue({ voucherId : selectedStore.firstLoginVoucherId}); 
            this.voucherId = selectedStore.firstLoginVoucherId;
          }, 0);
        }

      }
    });
  }

  onClicked() {
    this.showFields = true;
    this.loyaltyForm.reset();
  }

  save() {
    this.loyaltyForm.markAllAsTouched();
    if (this.loyaltyForm.valid) {
      this.getControl('LOYALTY_SCHEME')?.setValue('AMOUNT_SPENT_AMOUNT_REWARD_WALLET');
      const form = this.loyaltyForm.getRawValue();
      delete form.voucherId;
      this.store.dispatch(new UpdateStoreSettings(form));
    }
  }

  delete() {
    const form = {
      'LOYALTY_AMOUNT_SPENT': null,
      'LOYALTY_AMOUNT_REWARD': null,
      'LOYALTY_SCHEME': null,
    };

    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.settings.loyalty.confirmDeleteLoyalty');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.store.dispatch(new UpdateStoreSettings(form));
        this.loyaltyEnabled = false;
        this.showFields = false;
      }
    });
  }

  onVoucherChange(event) {
    this.loyaltyForm.patchValue({ voucherId : event.target.value});
    this.store.dispatch(new PartialUpdateStore({firstLoginVoucherId: this.getControl('voucherId').value === "null" ? null : this.getControl('voucherId').value}));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.loyaltyForm.get(name);
  }
}
