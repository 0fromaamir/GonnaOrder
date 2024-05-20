import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { StoresState, resrvationAllowCustomerSetting } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UpdateStoreSettings } from '../+state/stores.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { StoresScheduleService } from '../store-schedule/stores-schedule.service';
import { WindowRefService } from 'src/app/window.service';
import { ClientStoreRequest } from '../stores';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-store-reservations',
  templateUrl: './store-reservations.component.html',
  styleUrls: ['./store-reservations.component.scss']
})
export class StoreReservationsComponent implements OnInit, OnDestroy {
  @Input() storeData: ClientStoreRequest;
  settings: { [key: string]: any };
  // destroy$ = new Subject<void>();
  helpUrl: string;
  reservationsForm: FormGroup = this.fb.group({});
  private destroy$ = new Subject();
  storeId: any;
  scheduleId: number;
  RESERVATION_SCHEDULE: number;
  RESERVATION_SCHEDULE_CUSTOMER: number;
  isStoreOperator = false;
  scheduleList: any = [];
  resrvationAllowEnabled: boolean;
  notifyCustomerReservation: boolean;
  storeUrl = '';
  private protocol: string;
  private host: string;
  storeAlias = '';

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router, private schedule: StoresScheduleService, private windowService: WindowRefService, private store: Store<StoresState>,
    private translateService: TranslateService,
    private toasterService: ToastrService) {
    this.protocol = windowService.nativeWindowLocation.protocol;
  }

  ngOnInit() {

    this.reservationsForm = this.fb.group({
      // RESERVATION_ALLOW_CUSTOMER: [''],
      RESERVATION_DEFAULT_NUMBER_OF_PEOPLE: [''],
      RESERVATION_TIME_INTERVAL: [''],
      RESERVATION_AUTO_CONFIRM: [''],
      RESERVATION_DEFAULT_SLOT_DURATION: [''],
      RESERVATION_TEL_SELECTION: [''],
      RESERVATION_NAME_SELECTION: [''],
      RESERVATION_EMAIL_SELECTION: [''],
      RESERVATION_ALLOW_CUSTOMER: [this.resrvationAllowEnabled],

      // scheduleId: [0],
      RESERVATION_SCHEDULE: [0],
      RESERVATION_SCHEDULE_CUSTOMER: [0],
      CUSTOMER_RESERVATION_EMAIL_STATUS_CHANGE:['']
    });
    const params = this.route.parent.params as any;
    this.storeId = params._value.id;

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      this.settings = s.settings;
      this.storeAlias = s.aliasName;
      this.reservationsForm.patchValue(
        s.settings
      );
      if (s.settings.RESERVATION_ALLOW_CUSTOMER === 'ENABLED') {
        this.resrvationAllowEnabled = true;
      } else {
        this.resrvationAllowEnabled = false;
      }
      if (s.settings.CUSTOMER_RESERVATION_EMAIL_STATUS_CHANGE === 'ENABLED') {
        this.notifyCustomerReservation = true;
      } else {
        this.notifyCustomerReservation = false;
      }
      if (s.settings) {
        this.reservationsForm.get('RESERVATION_DEFAULT_SLOT_DURATION').setValue(s.settings.RESERVATION_DEFAULT_SLOT_DURATION);
        this.reservationsForm.get('RESERVATION_ALLOW_CUSTOMER').setValue(s.settings.RESERVATION_ALLOW_CUSTOMER);
        this.reservationsForm.get('RESERVATION_DEFAULT_NUMBER_OF_PEOPLE').setValue(s.settings.RESERVATION_DEFAULT_NUMBER_OF_PEOPLE);
        this.reservationsForm.get('RESERVATION_TIME_INTERVAL').setValue(s.settings.RESERVATION_TIME_INTERVAL);
        this.reservationsForm.get('RESERVATION_AUTO_CONFIRM').setValue(s.settings.RESERVATION_AUTO_CONFIRM);
        this.reservationsForm.get('RESERVATION_NAME_SELECTION').setValue(s.settings.RESERVATION_NAME_SELECTION);
        this.reservationsForm.get('RESERVATION_EMAIL_SELECTION').setValue(s.settings.RESERVATION_EMAIL_SELECTION);
        this.reservationsForm.get('RESERVATION_TEL_SELECTION').setValue(s.settings.RESERVATION_TEL_SELECTION);
        this.reservationsForm.get('RESERVATION_SCHEDULE').setValue(s.settings.RESERVATION_SCHEDULE);
        this.reservationsForm.get('RESERVATION_SCHEDULE_CUSTOMER').setValue(s.settings.RESERVATION_SCHEDULE_CUSTOMER);
        this.reservationsForm.get('CUSTOMER_RESERVATION_EMAIL_STATUS_CHANGE').setValue(s.settings.CUSTOMER_RESERVATION_EMAIL_STATUS_CHANGE);
      }
      this.storeUrl = this.protocol + '//' + s.aliasName + '.' + environment.envDomain + ':' + window.location.port + '/reservation';
    });

    if (!this.isStoreOperator) {
      this.schedule.getAllSchedules(this.storeId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(result => {
          this.scheduleList = result;
        });
    }

  }

  gotoAddSchedule(type: 'reservation' | 'customer'): void {
    try {
      localStorage.setItem('backLink', this.router.url);
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
      });
    } catch (e) {
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        state: { backLink: this.router.url }
      });
    }

  }

  copyStoreURL() {
    navigator.clipboard.writeText(this.storeUrl.toString());
  }

  selectAvailabilityHandler(event: any, type: 'reservation' | 'customer'): void {
    this.scheduleId = parseInt(event.target.value, 10); // Parse selected value as integer
    this.reservationsForm.patchValue({ scheduleId: this.scheduleId });

    const formObj = this.reservationsForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }

  onSubmit() {
    const formObj = this.reservationsForm.getRawValue();
    this.reservationsForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }
  onCheckboxChange(event) {
    const checked = event.target.checked;
    const formObj = this.reservationsForm.getRawValue();
    formObj.RESERVATION_ALLOW_CUSTOMER = checked ? 'ENABLED' : 'DISABLED'
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }
  onCheckEmailReservation(event) {
    const checked = event.target.checked;
    const formObj = this.reservationsForm.getRawValue();
    formObj.CUSTOMER_RESERVATION_EMAIL_STATUS_CHANGE = checked ? 'ENABLED' : 'DISABLED'
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
validateFormValue(formObject:any){
  let isValid = true;
  if( formObject.RESERVATION_DEFAULT_SLOT_DURATION!= null && formObject.RESERVATION_DEFAULT_SLOT_DURATION!= '' && formObject.RESERVATION_DEFAULT_SLOT_DURATION < 15){
    this.toasterService.error(this.translateService.instant('admin.reservation.invalidDefaultReservationDuration'));
    isValid = false
  }
  if( formObject.RESERVATION_TIME_INTERVAL!= null && formObject.RESERVATION_TIME_INTERVAL!= '' && formObject.RESERVATION_TIME_INTERVAL < 15){
    this.toasterService.error(this.translateService.instant('admin.reservation.invalidDefaultTimeIntervals'));
    isValid = false
  }
  return isValid;
}
  toggleSetting() {
    const formObj = this.reservationsForm
      .getRawValue();
      formObj.RESERVATION_ALLOW_CUSTOMER = formObj.RESERVATION_ALLOW_CUSTOMER ? "ENABLED" : "DISABLED";
      formObj.RESERVATION_DEFAULT_NUMBER_OF_PEOPLE =
        formObj.RESERVATION_DEFAULT_NUMBER_OF_PEOPLE === 0
          ? null
          : formObj.RESERVATION_DEFAULT_NUMBER_OF_PEOPLE;
      formObj.RESERVATION_DEFAULT_SLOT_DURATION =
        formObj.RESERVATION_DEFAULT_SLOT_DURATION == '' ||
        formObj.RESERVATION_DEFAULT_SLOT_DURATION == null
          ? 0
          : formObj.RESERVATION_DEFAULT_SLOT_DURATION;
      formObj.RESERVATION_TIME_INTERVAL =
        formObj.RESERVATION_TIME_INTERVAL == '' ||
        formObj.RESERVATION_TIME_INTERVAL == null
          ? 0
          : formObj.RESERVATION_TIME_INTERVAL;
      if(this.validateFormValue(formObj)){
    this.store.dispatch(new UpdateStoreSettings(formObj));
      }
  }
}