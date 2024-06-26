import { PushNotificationService } from 'src/app/shared/push-notification.service';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { LoadStoreOrder, LoadStoreOrdersSortFilter, UpdateBulkOrderStatus, UpdateOrderStatus } from '../+state/store-order.actions';
import { getStoreOrdersLoadingStatus, getStoreOrdersList, getUpdateBulkOrderStatus } from '../+state/store-order.selector';
import { Observable, timer, Subject, combineLatest, of, from } from 'rxjs';
import {
  getSelectedStore,
  getSelectedStoreApiStatus,
  getStoreAutoprintSupported,
  getStoreNotificationSupported,
  getStoreNotificationsEnabled,
} from '../../+state/stores.selectors';
import { ClientStore, OrderItem } from '../../stores';
import { withLatestFrom, takeUntil, tap, filter, take, map, switchMap } from 'rxjs/operators';
import { Paging } from 'src/app/api/types/Pageable';
import { helpPage } from 'src/app/shared/help-page.const';
import {
  RequestAutoprintPermission,
  RequestNotificationPermission,
  ToggleAutoprintSubscriptionStatus,
  ToggleAutoprintSubscriptionStatusSuccess,
  ToggleNotificationSubscriptionStatus,
  ToggleNotificationSubscriptionStatusSuccess,
  UpdateStoreTabUserExperience,
} from '../../+state/stores.actions';
import {
  SortMode,
  DateTimeRangeMode,
  DateTimeRangeType,
  StoreUserExperience,
  initialStoreUserExperience,
  initialTabSortFilterParams,
} from '../../+state/stores.reducer';
import {
  getSelectedStoreUserExperience,
} from '../../+state/stores.selectors';
import {
  getStoreLocationsList
} from '../../store-location/+state/store-location.selectors';
import { ActivatedRoute } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { DayType, Utils } from 'src/app/stores/utils/Utils';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../../store-users/store-users.component';
import { StoreOrderService } from '../store-order.service';
import { StoresOrdersState } from '../+state/store-order.reducer';
import { ToastrService } from 'ngx-toastr';
import { ClientStoreOrderStatus } from '../store-order';
import { getCatalogOverview } from '../../store-catalog/+state/stores-catalog.selectors';
import { Station } from '../../store-catalog/stores-catalog';
import { HelperService } from 'src/app/public/helper.service';
import { StoresService } from '../../stores.service';

@Component({
  selector: 'app-store-orders',
  templateUrl: './store-orders.component.html',
  styleUrls: ['./store-orders.component.scss']
})
export class StoreOrdersComponent implements OnInit, OnDestroy {
  orders$: Observable<any>;
  store$: Observable<ClientStore>;
  storeLocaleTimeZone$: Observable<{ locale: string; timezone: string; }>;
  load$: Observable<any>;
  notificationsEnabled$: Observable<boolean>;
  notificationsSupported$: Observable<boolean>;
  autoprintEnabled$: Observable<boolean>;
  autoprintSupported$: Observable<boolean>;
  notificationsEnabled: boolean;
  autoprintEnabled: boolean;

  destroy$: Subject<void> = new Subject<void>();
  isJapanese = false;
  isOrderDeletionAllowed = false;
  selectedOrderList = [];
  orderUuidList = [];

  status$: Observable<string>;

  sortModes = [
    {
      labelId: SortMode.NewestOrderSent,
      sortQuery: 'submittedAt,desc',
    },
    {
      labelId: SortMode.OldestOrderSent,
      sortQuery: 'submittedAt,asc',
    },
    {
      labelId: SortMode.NewestOrderWish,
      sortQuery: 'wishTime,desc',
    },
    {
      labelId: SortMode.OldestOrderWish,
      sortQuery: 'wishTime,asc',
    },
    {
      labelId: SortMode.NewestOrderExpected,
      sortQuery: 'estimatedTime,desc',
    },
    {
      labelId: SortMode.OldestOrderExpected,
      sortQuery: 'estimatedTime,asc',
    },
    {
      labelId: SortMode.NewestOrderEffective,
      sortQuery: 'effectiveTime,desc',
    },
    {
      labelId: SortMode.OldestOrderEffective,
      sortQuery: 'effectiveTime,asc',
    },
  ];

  dateTimeRangeModes = [
    {
      labelId: DateTimeRangeMode.OrderSent,
    },
    {
      labelId: DateTimeRangeMode.OrderWish,
    },
    {
      labelId: DateTimeRangeMode.OrderExpected,
    },
    {
      labelId: DateTimeRangeMode.OrderEffective,
    },
  ];

  dateTimeRangeFroms = [
    {
      labelId: DateTimeRangeType.NoFilter,
    },
    {
      labelId: DateTimeRangeType.Yesterday,
    },
    {
      labelId: DateTimeRangeType.Today,
    },
    {
      labelId: DateTimeRangeType.LastHour,
    },
    {
      labelId: DateTimeRangeType.Now,
    },
    {
      labelId: DateTimeRangeType.NextHour,
    },
    {
      labelId: DateTimeRangeType.Tomorrow,
    },
    {
      labelId: DateTimeRangeType.Custom,
    },
  ];

  dateTimeRangeTos = [
    {
      labelId: DateTimeRangeType.NoFilter,
    },
    {
      labelId: DateTimeRangeType.Yesterday,
    },
    {
      labelId: DateTimeRangeType.Today,
    },
    {
      labelId: DateTimeRangeType.LastHour,
    },
    {
      labelId: DateTimeRangeType.Now,
    },
    {
      labelId: DateTimeRangeType.NextHour,
    },
    {
      labelId: DateTimeRangeType.Tomorrow,
    },
    {
      labelId: DateTimeRangeType.Custom,
    },
  ];

  locations = [
    {
      id: '-1',
      label: 'admin.store.order.noFilter',
    },
  ];

  storeId: number;
  storeUserExperience: StoreUserExperience = { ...initialStoreUserExperience };

  ordersHelpPage = helpPage.order;

  dateFrom: Date;
  dateTo: Date;

  locationIdInURL: string;
  openTap: boolean;
  isCombinedOrderButtonPressed;
  selectedOrderId: string;
  selectedOrderInd: number;
  orderAvailableState = 'INITIAL';
  prevLatestOrder;
  stations: Station[] = [
    {
      stationId: null,
      name: 'admin.store.order.noFilter',
    },
  ];
  selectedStationId: number | null = null;
  orders;
  constructor(private store: Store<any>,
    private pushNotificationService: PushNotificationService,
    public dialog: MatDialog,
    private storeOrderService: StoreOrderService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private storeService: StoresService
  ) { }

  public get SortMode(): typeof SortMode {
    return SortMode;
  }

  public get DateTimeRangeMode(): typeof DateTimeRangeMode {
    return DateTimeRangeMode;
  }

  public get DateTimeRangeType(): typeof DateTimeRangeType {
    return DateTimeRangeType;
  }

  ngOnInit() {
    this.orders$ = this.store.select(getStoreOrdersList);
    this.store$ = this.store.select(getSelectedStore);
    this.storeUserExperience.OPEN.tabSortFilterParams.openTap = false;
    this.store$.pipe(
      filter(s => s.id !== -1),
      take(1)
    ).subscribe(s => {
      this.isOrderDeletionAllowed = !!s.settings.ALLOW_ORDER_DELETE;
    });
    this.orders$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((orders) => {
      this.orders = orders;
      if (!!orders && !!orders.data && orders.status === 'LOADED' && orders.data.length > 0) {
        let order = orders.data.find(data => data.uuid === this.selectedOrderId);
        this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId =
          this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId ?? '';
        this.selectedStationId = this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId;
        if ((this.selectedOrderId === undefined || this.prevLatestOrder && new Date(orders.data[0].submittedAt) > new Date(this.prevLatestOrder.submittedAt)) && this.storeUserExperience.tab === 'OPEN') {
          this.store.dispatch(new LoadStoreOrder(this.storeId, orders.data[0].uuid, this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId));
          this.selectedOrderId = orders.data[0].uuid;
          this.selectedOrderInd = 0;
          this.prevLatestOrder = orders.data[0];
        } else if (this.selectedOrderId && this.selectedOrderId.length > 0 && !order && this.storeUserExperience.tab === 'OPEN' && orders.data[this.selectedOrderInd]) {
          this.store.dispatch(new LoadStoreOrder(this.storeId, orders.data[this.selectedOrderInd].uuid, this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId));
          this.selectedOrderId = orders.data[this.selectedOrderInd].uuid;
          setTimeout(() => {
            let elem = document.getElementById("order-detail-" + this.selectedOrderId);
            if (elem && !this.isElementInView(elem)) {
              let elemHeight = elem.getBoundingClientRect().height + 50;
              window.scrollBy(0, elemHeight);
            }
          }, 200)

        } else if (order && orders.data[this.selectedOrderInd].uuid !== this.selectedOrderId && this.storeUserExperience.tab === 'OPEN') {
          this.store.dispatch(new LoadStoreOrder(this.storeId, orders.data[this.selectedOrderInd].uuid));
          this.selectedOrderId = orders.data[this.selectedOrderInd].uuid;
        } else if (order && this.storeUserExperience.tab !== 'OPEN' && this.selectedStationId) {
          this.store.dispatch(new LoadStoreOrder(order.storeId, order.uuid, this.selectedStationId));
        }
        this.orderUuidList = orders?.data.map(order => order.uuid);
        if (orders.data.length === 0 && orders.paging.page > 0) {
          this.paginate({ page: orders.paging.page - 1, size: 20, });
        }

        if (this.helperService.isMobileApp()) {
          this.storeService.getStorage('autoprintSubscriptions')
            .then(subscriptions => 
              this.autoprintEnabled = (!!this.storeId && !!subscriptions) ? (subscriptions[`${this.storeId}`] !== undefined ? true : this.autoprintEnabled) || this.autoprintEnabled : this.autoprintEnabled);
          
          this.storeService.getStorage('notificationSubscriptions')
            .then(subscriptions => 
              this.notificationsEnabled = (!!this.storeId && !!subscriptions) ? (subscriptions[`${this.storeId}`] !== undefined ? true : this.notificationsEnabled) || this.notificationsEnabled : this.notificationsEnabled);
        }
      }

      if (orders?.status === 'LOADED') {
        this.orderAvailableState = orders?.data?.length > 0 ? 'ORDERS_AVAILABLE' : 'NO_ORDERS_AVAILABLE';
      }

    });
    this.status$ = this.store.select(getStoreOrdersLoadingStatus);
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

    const storeLoadingStatus$ = this.store.select(getSelectedStoreApiStatus);

    combineLatest([
      this.store.pipe(
        takeUntil(this.destroy$),
        select(getSelectedStoreUserExperience)
      ),
      this.store$.pipe(
        takeUntil(this.destroy$),
        filter(s => s.id > 0),
      ),
      this.store.select(getStoreLocationsList).pipe(
        takeUntil(this.destroy$),
        filter(list => !!list && list.status === 'LOADED'),
      ),
    ]).subscribe(([storeExp, selectedStore, list]) => {
      this.locations = [{ id: '-1', label: 'admin.store.order.noFilter' }];
      list.data.forEach(element => {
        this.locations.push({
          id: element.id.toString(),
          label: element.label,
        });
      });
      if (storeExp) {
        this.storeUserExperience = JSON.parse(JSON.stringify(storeExp));
      }
      if (
        selectedStore.id > 0 &&
        this.storeUserExperience &&
        this.storeUserExperience.tab &&
        this.storeUserExperience[this.storeUserExperience.tab]) {

        this.store.dispatch(
          new LoadStoreOrdersSortFilter(
            selectedStore.id,
            this.storeUserExperience.tab,
            { ...this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams },
            { ...this.storeUserExperience[this.storeUserExperience.tab].tabPaging }
          )
        );

        this.dateFrom = new Date(this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customDateFrom);
        this.dateTo = new Date(this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customDateTo);
      }
    });

    this.store$.pipe(
      takeUntil(this.destroy$),
      map(s => {
        switch (s.subscription && s.subscription.status) {
          case 'TRIAL':
            return !!s.numberOfOffers ? { rate: 2000, id: s.id } : { rate: 0, id: s.id };
          case 'VALID':
            return { rate: 4000, id: s.id };
          case 'TRIAL_EXCEEDED':
            return { rate: 0, id: s.id };
        }
        return { rate: 0, id: s.id };
      }),
      tap(data => this.storeId = data.id),
      filter(data => data.rate > 0),
      switchMap(data =>
        timer(0, data.rate).pipe(
          takeUntil(this.destroy$),
          withLatestFrom(storeLoadingStatus$, this.store.select(getStoreOrdersLoadingStatus)),
          filter(([_,]) => this.storeUserExperience.tab === 'OPEN'),
          filter(([_, storeStatus, orderStatus]) => storeStatus === 'LOADED' && orderStatus === 'LOADED'),
          tap(([_,]) => {
            this.store.dispatch(new LoadStoreOrdersSortFilter(data.id,
              this.storeUserExperience.tab,
              { ...this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams },
              { ...this.storeUserExperience[this.storeUserExperience.tab].tabPaging }));
          }
          )
        )
      )
    ).subscribe();

    this.notificationsSupported$ = this.store.select(getStoreNotificationSupported);
    this.store.select(getStoreNotificationsEnabled)
      .subscribe(storeNotificationsEnabled => {
        if (this.helperService.isMobileApp()) {
          this.storeService.getStorage('notificationSubscriptions')
            .then(subscriptions => 
              this.notificationsEnabled = (!!this.storeId && !!subscriptions) ? (subscriptions[`${this.storeId}`] !== undefined ? true : false) || false : false);
        } else {
          this.notificationsEnabled = storeNotificationsEnabled;
        }
    });

    if (this.helperService.isMobileApp()) {
      this.autoprintSupported$ = this.store.select(getStoreAutoprintSupported);
      this.storeService.loadAutoprintSubscriptionStatus(this.storeId)
        .subscribe(res => {
            this.storeService.getStorage('autoprintSubscriptions')
              .then(subscriptions => {
                this.autoprintEnabled = (!!this.storeId && !!subscriptions) ? (subscriptions[`${this.storeId}`] !== undefined ? true : false) || false : false;
            });
      });    
    }

    this.store.select(getStoreLocationsList).pipe(
      filter(list => !!list && list.status === 'LOADED'),
      take(1),
    ).subscribe(list => {
      this.locationIdInURL = this.route.snapshot.queryParams.locationId;
      this.storeUserExperience.OPEN.tabSortFilterParams.openTap = false;
      this.openTap = this.route.snapshot.queryParams.openTap;
      const result = list.data.filter(element => element.id.toString() === this.locationIdInURL);
      if (this.locationIdInURL && result.length > 0) {
        this.storeUserExperience.OPEN.tabSortFilterParams.locationId = this.locationIdInURL;
        this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId = this.selectedStationId;
        this.storeUserExperience.OPEN.tabFilterBtnStatus.filterPinStatus = 'PINNED';
        this.storeUserExperience.OPEN.tabFilterBtnStatus.filterBtnStatus = 'ENABLED';
        if (this.openTap) {
          this.storeUserExperience.OPEN.tabSortFilterParams.openTap = true;
        } else {
          this.storeUserExperience.OPEN.tabSortFilterParams.openTap = false;
        }
        this.updateTabSortFilterStatus();
        this.loadStoreOrdersSortFilter();
      }
    });

    this.store.select(getCatalogOverview).subscribe(data => {
      if (data && this.stations.length <= 1) {
        this.stations = data.stations ? [...this.stations, ...data.stations] : [];
      }
    });

    this.store.select(getUpdateBulkOrderStatus).pipe(
      takeUntil(this.destroy$)
    ).subscribe((bulkOrderUpdateStatus) => {
      if (bulkOrderUpdateStatus === 'SUCCESS') {
        this.selectedOrderList = [];
        this.loadStoreOrdersSortFilter();
      }
    });
  }

  isElementInView(element) {
    let rect = element.getBoundingClientRect();

    // Check if the element is entirely in the viewport
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  paginate(paging: Paging) {
    this.selectedOrderList = [];
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { ...paging };
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  onTabBtnClick(tabName: string) {
    this.selectedOrderList = [];
    this.storeUserExperience.tab = tabName;
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { page: 0, size: 20, };
    this.dateFrom = new Date(this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customDateFrom);
    this.dateTo = new Date(this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customDateTo);
    this.selectedStationId = this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  toggleNotifications($event: any) {
    if ($event.target.checked === true) {
      this.notificationsEnabled = true;

      this.store.dispatch(new ToggleNotificationSubscriptionStatusSuccess(true));
      this.store.dispatch(new RequestNotificationPermission());
    } else {
      
      if (this.helperService.isMobileApp()) {
        this.notificationsEnabled = false;
        this.autoprintEnabled = false;
        
        this.store.dispatch(new ToggleNotificationSubscriptionStatus(false, null));
      } else {
        this.pushNotificationService.currentSubscription().pipe(take(1)).subscribe(
          s => this.store.dispatch(new ToggleNotificationSubscriptionStatus(false, s)),
          _ => this.store.dispatch(new ToggleNotificationSubscriptionStatus(false, null)));
      }
    }
  }

  toggleAutoprint($event: any) {
    if ($event.target.checked === true) {
      this.autoprintEnabled = true;

      this.store.dispatch(new ToggleAutoprintSubscriptionStatusSuccess(true));
      this.store.dispatch(new RequestAutoprintPermission());
    } else {
      this.autoprintEnabled = false;

      this.store.dispatch(new ToggleAutoprintSubscriptionStatus(false));
    }
  }

  toggleServeFilter($event) {
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { page: 0, size: 20, };
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.isServe = $event.target.checked;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  togglePickupFilter($event) {
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { page: 0, size: 20, };
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.isPickup = $event.target.checked;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  toggleOpenTapFilter($event) {
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { page: 0, size: 20, };
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.openTap = $event.target.checked;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  toggleAddressFilter($event) {
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { page: 0, size: 20, };
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.isAddress = $event.target.checked;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  searchCustomerName(event) {
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { page: 0, size: 20, };

    if (event.target.value) {
      this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customerName = event.target.value;
    } else {
      this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customerName = '';
    }
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  searchOrderToken(event) {
    this.storeUserExperience[this.storeUserExperience.tab].tabPaging = { page: 0, size: 20, };

    if (event.target.value) {
      this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.orderToken = event.target.value;
    } else {
      this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.orderToken = '';
    }
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  updateTabSortFilterStatus() {
    this.store$.pipe(
      take(1)
    ).subscribe(s => {
      this.store.dispatch(new UpdateStoreTabUserExperience(
        s.id,
        this.storeUserExperience.tab,
        { ...this.storeUserExperience[this.storeUserExperience.tab], },
      ));
    });
  }

  // only clears filter criteria...
  clearFilterCriteria() {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams = { ...initialTabSortFilterParams };
  }

  onFilterBtnClick() {
    if (this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterBtnStatus === 'ENABLED') {
      this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterBtnStatus = 'DISABLED';
      // when filter btn is disabled, clears filter criteria automatically and...
      this.clearFilterCriteria();
      this.updateTabSortFilterStatus();
      // reload store orders
      this.loadStoreOrdersSortFilter();
    } else if (this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterBtnStatus === 'DISABLED') {
      this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterBtnStatus = 'ENABLED';
      // enables the filter pin automatically when filter btn is enabled
      this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterPinStatus = 'PINNED';
      this.updateTabSortFilterStatus();
    }
  }

  onFilterPinClick() {
    if (this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterPinStatus === 'PINNED') {
      this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterPinStatus = 'UNPINNED';
    } else if (this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterPinStatus === 'UNPINNED') {
      this.storeUserExperience[this.storeUserExperience.tab].tabFilterBtnStatus.filterPinStatus = 'PINNED';
    }
    this.updateTabSortFilterStatus();
  }

  onLocationChange(selectedLocationId) {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.locationId = selectedLocationId;
    if (selectedLocationId === '-1' || !selectedLocationId) {
      this.storeUserExperience.OPEN.tabSortFilterParams.openTap = false;
    }
    this.loadStoreOrdersSortFilter();
    this.updateTabSortFilterStatus();
  }

  onSortModeChange(sortLabelId: SortMode) {
    const selectedSortMode = this.sortModes.find(sortMode => sortMode.labelId === sortLabelId);
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.labelId = selectedSortMode.labelId;
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.sortQuery = selectedSortMode.sortQuery;
    this.loadStoreOrdersSortFilter();
    this.updateTabSortFilterStatus();
  }

  onStationChange(stationId: number) {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId = stationId;
    this.selectedOrderId = undefined;
    this.loadStoreOrdersSortFilter();
    this.updateTabSortFilterStatus();
  }


  onDateTimeRangeModeChange(dateTimeRangeModeLabelId: DateTimeRangeMode) {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.dateTimeRangeMode = dateTimeRangeModeLabelId;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  onDateTimeRangeFromChange(dateTimeRangeFromLabelId: DateTimeRangeType) {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.dateTimeRangeFrom = dateTimeRangeFromLabelId;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  onDateTimeRangeToChange(dateTimeRangeToLabelId: DateTimeRangeType) {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.dateTimeRangeTo = dateTimeRangeToLabelId;
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  fromDateChange(event: MatDatepickerInputEvent<Date>) {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customDateFrom = this.getDayStart(event.value.toISOString());
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  toDateChange(event: MatDatepickerInputEvent<Date>) {
    this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.customDateTo = this.getDayEnd(event.value.toISOString());
    this.updateTabSortFilterStatus();
    this.loadStoreOrdersSortFilter();
  }

  loadStoreOrdersSortFilter() {
    this.store$.pipe(
      take(1)
    ).subscribe(s => {
      this.isOrderDeletionAllowed = !!s.settings.ALLOW_ORDER_DELETE;
      this.store.dispatch(new LoadStoreOrdersSortFilter(s.id,
        this.storeUserExperience.tab,
        { ...this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams },
        { ...this.storeUserExperience[this.storeUserExperience.tab].tabPaging }));
    });
  }

  getDayStart(inputDateStr: string) {
    return Utils.getDayStart(inputDateStr);
  }

  getDayEnd(inputDateStr: string) {
    return Utils.getDayEnd(inputDateStr);
  }

  dayCheck(inputDateStr: string) {
    return Utils.dayCheck(inputDateStr);
  }

  get DayType(): typeof DayType {
    return DayType;
  }

  isOrderDeleteAllowed() {
    return !(this.storeUserExperience?.tab === 'REJECTED' && !this.isOrderDeletionAllowed);
  }

  toggleOrderSelection($event, orderUuid) {
    $event.stopPropagation();
    if ($event.target.checked === true) {
      this.selectedOrderList.push(orderUuid);
    } else {
      this.selectedOrderList.splice(this.selectedOrderList.indexOf(orderUuid), 1);
    }
  }

  toggleAllOrderSelection($event) {
    if ($event.target.checked === true) {
      this.selectedOrderList = [...this.orderUuidList];
    } else {
      this.selectedOrderList = [];
    }
  }

  changeOrderStatusInBulk(status, isReady?: boolean) {
    if (!!this.selectedOrderList) {
      this.store.dispatch(new UpdateBulkOrderStatus({
        uuids: this.selectedOrderList,
        status,
        isReady
      }));
    }
  }

  openCombineOrdersDialog() {
    if (this.isCombinedOrderButtonPressed && this.isCombinedOrderButtonPressed === true) {
      return;
    }
    this.isCombinedOrderButtonPressed = true;
    this.storeOrderService.getOrders(this.storeId, this.selectedOrderList).subscribe(
      (response: any) => {
        this.isCombinedOrderButtonPressed = false;
        const options = {
          width: '750px',
          data: { data: response, selectedOrderList: this.selectedOrderList, storeId: this.storeId },
          panelClass: 'invite-user-dialog',
        };
        const dialogRef = this.dialog.open(StoreCombineOrdersDialogComponent, options);
        dialogRef.afterClosed().subscribe(result => {
        });
      },
      (error: any) => {
        this.isCombinedOrderButtonPressed = false;
        if (error && error.error && error.error.errors.length > 0 && error.error.errors[0].message) {
          this.toastr.error(error.error.errors[0].message);
        }
      }
    );
  }

  collapseOrder() {
    this.selectedOrderId = "";
    this.selectedOrderInd = null;
    Utils.scrollTop(200);
  }

  selectOrder($event, order, ind) {
    if (order.uuid === this.selectedOrderId) {
      this.collapseOrder();
    } else {
      this.setOrderToReceived(order);
      this.store.dispatch(new LoadStoreOrder(this.storeId, order.uuid, this.storeUserExperience[this.storeUserExperience.tab].tabSortFilterParams.stationId));
      this.selectedOrderId = order.uuid;
      this.selectedOrderInd = ind;
    }
  }

  setOrderToReceived(order) {
    if (order && order.status === 'SUBMITTED' && order.uuid !== '') {
      this.store.dispatch(new UpdateOrderStatus(
        order.uuid,
        'RECEIVED' as ClientStoreOrderStatus,
        order.rejectReason,
        order.estimatedTime,
        order.isReady,
      ));
    }
  }

  isMobileApp() : boolean {
    return this.helperService.isMobileApp();
  }
}


@Component({
  selector: 'app-store-combine-orders-dialog',
  templateUrl: 'store-combine-orders.html'
})
export class StoreCombineOrdersDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<StoreCombineOrdersDialogComponent>,
    private store: Store<StoresOrdersState>,
    private storeOrderService: StoreOrderService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }


  order: any;
  isJapanese: boolean;
  storeLocaleTimeZone$: Observable<{ locale: string; timezone: string; }>;
  currencySymbol: any;
  orderItems: any = [];

  ngOnInit() {
    this.order = { ...this.data.data };

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

    this.orderItems = this.order.orderItems;
  }

  orderDownload() {
    this.storeOrderService.downloadCombinedOrderPdf(this.data.storeId, this.data.selectedOrderList).subscribe(
      (response: any) => {
        const downloadURL = window.URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = response.filename;
        link.click();
      },
      (error: any) => {

      }
    );
  }

  onOrderPrint() {
    this.storeOrderService.downloadCombinedOrderPdf(this.data.storeId, this.data.selectedOrderList).subscribe(
      (data: any) => {
        this.storeOrderService.printBlobPDF(data.blob, data.filename);
      },
      (error: any) => {

      }
    );
  }

  save(): void {
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get DayType(): typeof DayType {
    return DayType;
  }

  dayCheck(inputDateStr: string) {
    return Utils.dayCheck(inputDateStr);
  }

  shouldDisplayTotal() {
    if (this.order?.orderItems) {
      for (const item of this.order.orderItems) {
        if (item.totalNonDiscountedPrice !== 0) { return true; }
      }
      return (this.getCartTotal() === 0) ? false : true;
    } else {
      return false;
    }
  }

  getCartTotal() {
    let ret = 0;
    if (this.order.orderItems) {
      this.order.orderItems.forEach(item => {
        ret += (item.discountType) ? item.totalDiscountedPrice : item.totalNonDiscountedPrice;
      });
    }
    return ret;
  }

  /**
   * Gets if the parent order item price has to be shown
   *
   * @param orderItem The parent order item
   * @return If the parent order item price has to be shown
   */
  isShowParentItemPrice(orderItem: OrderItem) {

    if (orderItem.quantity > 1
      || (orderItem.discountValue !== undefined
        && orderItem.discountValue > 0)) {
      return true;
    }
    if (orderItem.childOrderItems !== undefined
      && orderItem.childOrderItems.length > 0) {
      let found = false;
      orderItem.childOrderItems.forEach(childOrderItem => {
        if (childOrderItem.offerPrice !== undefined && childOrderItem.offerPrice > 0) {
          found = true;
        }
      });
      return found;
    }
    return false;
  }

}

