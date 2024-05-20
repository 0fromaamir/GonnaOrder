import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { AdminStandalonePaymentSearch } from '../+state/stores.actions';
import { getCreatedStandaloneOrderData } from '../+state/stores.selectors';
import { filter, map, takeUntil } from 'rxjs/operators';
import { StandalonePaymentOrder } from 'src/app/public/store/types/StandalonePayment';
import { getSelectedStore } from '../../+state/stores.selectors';
import { DayType, Utils } from 'src/app/stores/utils/Utils';
import { getStoreLocationsList } from '../../store-location/+state/store-location.selectors';
import { LoadStoreLocations, Initialize as InitializeStoreLocations } from '../../store-location/+state/store-location.actions';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Paging } from 'src/app/api/types/Pageable';
import { PayOnlineDialogComponent } from '../../pay-online-dialog/pay-online-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-standalone-payment-orders',
  templateUrl: './standalone-payment-orders.component.html',
  styleUrls: ['./standalone-payment-orders.component.scss']
})
export class StandalonePaymentOrdersComponent implements OnInit, OnDestroy {

  standalonePaymentOrders: StandalonePaymentOrder[] = [];
  totalPages: number;
  pageNumber = 0;
  pageSize = 20;
  unsubscribe$: Subject<void> = new Subject<void>();
  storeLocaleTimeZone$: Observable<{ locale: string; timezone: string; }>;
  isJapanese: boolean;
  locations = [
    {
      id: null,
      label: 'admin.store.order.noFilter',
    },
  ];
  form: FormGroup;
  selectedStoreId: number;
  typingTimeout;
  storeAliasName: string;
  selectedStore;
  helpPage: string;
  helpUrl: string;
  constructor(
    private store: Store<any>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.helpPage = 'menuStandalonePayment';
    this.helpUrl = 'paymentRequests';
    this.route.params.forEach(val => {
      this.selectedStoreId = Number(val.id);
    });

    this.store.pipe(select(getSelectedStore)).subscribe((store) => {
      this.storeAliasName = store.aliasName;
      this.selectedStore = store;
    });


    if (this.selectedStoreId) {
      this.store.dispatch(new AdminStandalonePaymentSearch(this.selectedStoreId, null, null, null,
        { page: this.pageNumber, size: this.pageSize }));
      this.store.dispatch(new InitializeStoreLocations());
      this.store.dispatch(new LoadStoreLocations(this.selectedStoreId, { page: 0, size: 10000 }));
    }

    this.store.select(getCreatedStandaloneOrderData).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state.status === 'ITEMSEARCHSUCCESS') {
          this.standalonePaymentOrders = state.standalonePaymentOrders;
          this.totalPages = state.totalPages;
        }
      });

    this.storeLocaleTimeZone$ = this.store.pipe(
      select(getSelectedStore),
      filter(s => s.id > 0),
      map(s => ({
        locale: s.address.country.defaultLocale + '-' + s.address.country.code,
        timezone: s.timeZone
      }))
    );
    this.storeLocaleTimeZone$.subscribe((timezone) => {
      this.isJapanese = (timezone.locale === 'ja-JP');
    });

    this.store.select(getStoreLocationsList).pipe(
      takeUntil(this.unsubscribe$),
      filter(list => !!list && list.status === 'LOADED'),
    ).subscribe((list) => {
      this.locations = [{ id: null, label: 'admin.store.order.noFilter' }];
      list.data.forEach(element => {
        this.locations.push({
          id: element.id.toString(),
          label: element.label,
        });
      });
    });

    this.form = this.fb.group({
      customerName: [null],
      location: [null],
      openTap: [null],
      amount: [''],
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  dayCheck(inputDateStr: string) {
    return Utils.dayCheck(inputDateStr);
  }

  get DayType(): typeof DayType {
    return DayType;
  }

  onLocationChange($event) {
    const formValues = this.form.getRawValue();
    if (formValues.openTap === false && formValues.openTap !== null) {
      this.getControl('openTap')?.setValue(null);
      this.getControl('openTap')?.updateValueAndValidity();
    }
    this.store.dispatch(
      new AdminStandalonePaymentSearch(this.selectedStoreId, formValues.location, formValues.openTap, formValues.customerName,
        { page: 0, size: this.pageSize })
    );
  }

  onNameChange() {
    clearTimeout(this.typingTimeout);
    const formValues = this.form.getRawValue();
    if (formValues.customerName === '') {
      this.getControl('customerName')?.setValue(null);
      this.getControl('customerName')?.updateValueAndValidity();
    }
    this.typingTimeout = setTimeout(() => {
      this.store.dispatch(
        new AdminStandalonePaymentSearch(this.selectedStoreId, formValues.location, formValues.openTap, formValues.customerName,
          { page: 0, size: this.pageSize })
      );
    }, 1000);
  }

  getControl(name: string) {
    return this.form?.get(name);
  }

  paginate(paging: Paging) {
    const formValues = this.form.getRawValue();
    this.pageNumber = paging.page;
    this.store.dispatch(
      new AdminStandalonePaymentSearch(this.selectedStoreId, formValues.location, formValues.openTap, formValues.customerName, paging)
    );
  }

  createPaymentRequest() {
    const formValues = this.form.getRawValue();
    if (formValues.amount > 0) {
      const dialogRef = this.dialog.open(PayOnlineDialogComponent, {
        width: '450px',
        data: {
          storeAliasName: this.storeAliasName,
          uuid: undefined, storeId: this.selectedStoreId,
          amount: formValues.amount,
          selectedStore: this.selectedStore,
        },
        panelClass: 'pay-online-dialog'
      });
    } else {
      this.toastr.error(this.translate.instant('admin.store.order.positiveAmountErrorMsg'));
    }
  }
}
