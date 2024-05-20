import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '../../../public/store/store.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { ClientStore } from '../../stores';
import { AddReservationRequest } from '../reservation-models/AddReservationRequest';
import { ReservationStatus } from '../reservation-models/reservation-status';
import { ReservationSquare } from '../reservation-models/reservationSquare';
import { Reservation } from '../reservation-models/reservation';
import { StoreLocationService } from '../../store-location/store-location.service';
import { UpdateReservationRequest } from '../reservation-models/UpdateReservationRequest';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-book-update-reservations',
  templateUrl: './book-update-reservations.component.html',
  styleUrls: ['./book-update-reservations.component.scss']
})
export class BookUpdateReservationsComponent implements OnInit {
  action = '';
  storeId = '';
  date = '';
  statusList: string[] = [ReservationStatus.REQUESTED, ReservationStatus.ACCEPTED, ReservationStatus.REJECTED, ReservationStatus.ASSIGNED, ReservationStatus.COMPLETED];
  peopleList: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  peopleNumberSelected = 0;
  timeSlotForm: FormGroup;
  form: FormGroup;
  countryCode = '';
  selectedStore: ClientStore;
  selectedStore$: Observable<ClientStore>;
  addReservationRequest: AddReservationRequest = {
    storeId: 0,
    arrivalTime: '',
    departureTime: '',
    numberOfPeople: 0,
    name: '',
    phone: '',
    email: '',
    location: {},
    status: ReservationStatus.REQUESTED,
    comment: '',
    occasion: '',
    reason: ''
  };
  updateReservationRequest: UpdateReservationRequest = {
    id: 0,
    storeId: 0,
    arrivalTime: '',
    departureTime: '',
    numberOfPeople: 0,
    name: '',
    phone: '',
    email: '',
    location: {},
    status: ReservationStatus.REQUESTED,
    comment: '',
    occasion: '',
    reason: ''
  };
  arrivalTime: string;
  departureTime: string;
  customerName: string;
  numberOfPeople: string;
  phone: string;
  email: string;
  status: ReservationStatus;
  comment: string;
  occasion: string;
  reason: string;
  startTime: string;
  locations: any[];
  reservationSquare: ReservationSquare;
  selectedStatus: ReservationStatus;
  reservation: Reservation;
  tableId = 0;
  unsubscribe$: Subject<void> = new Subject<void>();
  defaultNumOfPeople = 0;
  defaultDurationTime = 0;
  defaultTimeInterval = 5;
  availableHours = [];
  availableEndHour = '';
  availableStartHour = '';
  startOfDay = new Date();
  endOfDay = new Date();
  matcher = new MyErrorStateMatcher();
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private storeScheduleService: StoresScheduleService,
    private router: Router,
    private translateService: TranslateService,
    private toasterService: ToastrService,
    private store: Store,
    private fb: FormBuilder,
    private storeLocationService: StoreLocationService,
    private cd: ChangeDetectorRef,
    private storeService: StoreService,
    public dialogRef: MatDialogRef<BookUpdateReservationsComponent>) {

    this.selectedStore = data.selectedStore;
    this.action = this.data.action;
    this.date = this.data.date;
    this.storeId = this.data.storeId;
    this.reservation = this.data.reservation;
    this.timeSlotForm = this.fb.group({
      items: [null, this.twoSelectionsValidator]
    });
    this.form = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      name: [''],
      phone: ['', Validators.required],
      email: ['', Validators.email],
      notes: ['', Validators.maxLength(256)]
    });

  }

  ngOnInit(): void {
    this.getStore();
    this.getTables();
    setTimeout(() => {
      this.getOpeningTimes();
    }, 500);
  }


  getVariablesValues() {
    this.form.get('startTime').valueChanges.subscribe(value => {
      this.form.controls.endTime.setValue(this.updateDepartureTime());
    });
    this.reservationSquare = this.data.reservationSquare;
    if (this.action == 'CreateFromTable') {
      this.reservationSquare.tableId = Number(this.data.reservationSquare.tableId);
      this.tableId = this.reservationSquare.tableId;
      this.form.controls.startTime.setValue(this.convertToIsoDate(this.reservationSquare.startTime));
    } else if (this.action == 'UPDATE') {
 
      this.form.controls.startTime.setValue(this.parseISOString(this.reservation.arrivalTime));
      this.form.controls.endTime.setValue(this.parseISOString(this.reservation.departureTime));
      this.form.controls.name.setValue(this.reservation?.name);
      this.form.controls.phone.setValue(this.reservation?.phone ?? this.getCountryCode());
      this.form.controls.email.setValue(this.reservation?.email);
      this.form.controls.notes.setValue(this.reservation?.comment);
      this.tableId = this.reservation?.location?.id;
      this.date = this.reservation.arrivalTime;
      this.peopleNumberSelected = this.reservation.numberOfPeople;
      this.selectedStatus = this.data.selectedStatus;
      this.cd.detectChanges();
    }
 }


  getStore() {
    this.storeService.load(this.storeId).subscribe((value) => {
      this.peopleNumberSelected = this.peopleNumberSelected != 0 ? this.peopleNumberSelected : value.settings["RESERVATION_DEFAULT_NUMBER_OF_PEOPLE"];
      this.defaultDurationTime = value.settings["RESERVATION_DEFAULT_SLOT_DURATION"];
      this.defaultTimeInterval = value.settings["RESERVATION_TIME_INTERVAL"];
    });
  }
  getHoursBetween(start: string, end: string): string[] {
    const result: string[] = [];
    const current = new Date(`1970-01-01T${start}`);
    const endHour = new Date(`1970-01-01T${end}`);

    while (current <= endHour) {
      const hour = current.getHours();
      const hourString = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      result.push(hourString);
      this.availableHours.push(hourString);
      current.setHours(current.getHours() + 1);
    }
    return result;
  }
  getOpeningTimes() {
    this.storeScheduleService.getSpecialSchedule('OPENING_HOURS', Number(this.storeId)).subscribe((value) => {
      if (value[0] != null) {
        this.availableStartHour = value[0].schedule.availabilities[0].startTime ?? '00:00:00';
        this.availableEndHour = value[0].schedule.availabilities[0].endTime ?? '23:00:00';
        this.availableHours = this.getHoursBetween(this.availableStartHour, this.availableEndHour);
      }
      else {
        this.availableHours = this.getHoursBetween('00:00:00', '23:00:00');
      }
      this.startOfDay.setHours(this.availableHours[0] != null && this.availableHours[0].split(':')[0] != null ? Number(this.availableHours[0].split(':')[0]) : 0, 0, 0, 0);
      this.startOfDay.setMinutes(this.availableHours[0] != null && this.availableHours[0].split(':')[1] != null ? Number(this.availableHours[0].split(':')[1]) : 0);
      this.endOfDay.setHours(this.availableHours[this.availableHours.length - 1].split(':')[0] != null ? Number(this.availableHours[this.availableHours.length - 1].split(':')[0]) : 0, 0, 0, 0);
      this.endOfDay.setMinutes(this.availableHours[this.availableHours.length - 1].split(':')[1] ?? 0);

    });
    setTimeout(() => {
      this.getVariablesValues();
    }, 500);

  }
  getTables() {
    this.storeLocationService.list(Number(this.storeId)).subscribe((tables) => {
      this.locations = tables.data;
    });
  }

  convertToIsoDate(time: string): string {
    const [hours, minutes] = time.split(':');
    const isoDate = new Date(this.date);
    isoDate.setHours(Number(hours));
    isoDate.setMinutes(Number(minutes));
    return isoDate.toISOString();
  }

  formatDateToISO(dateString: string): string {
    if(!dateString){
      return null;
    }
    const date = new Date(dateString);
    const dateObject = new Date(this.date);
    date.setDate(dateObject.getDate());
    date.setFullYear(dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate());
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);
    return date.toISOString();
  }

  parseISOString(isoDate: string): Date {
    const cleanedIsoDate = isoDate.replace('Z', '');

    const date = new Date(cleanedIsoDate);

    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() + offset);

    return date;
  }

  updateDepartureTime() {
    const start = new Date(this.form.controls.startTime.value);
    start.setMinutes(start.getMinutes() + this.defaultDurationTime);
      return start;
  }

  twoSelectionsValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && value.length === 2) {
      return null;
    } else {
      return { invalid: true };
    }
  }

  onDateChange(date: string) {
    this.date = date;
    console.log("🚀 ~ BookUpdateReservationsComponent ~ onDateChange ~ this.date:", this.date)
  }

  onChange(event: any) {
    this.peopleNumberSelected = event.value;
  }

  onTableChange(event: any) {
    this.reservationSquare.tableId = event.value;
  }

  onStatusChange(event: any) {
    switch (event.value) {
      case ReservationStatus.REQUESTED:
        this.selectedStatus = ReservationStatus.REQUESTED;
        break;
      case ReservationStatus.ASSIGNED:
        this.selectedStatus = ReservationStatus.ASSIGNED;
        break;
      case ReservationStatus.REJECTED:
        this.selectedStatus = ReservationStatus.REJECTED;
        break;
      case ReservationStatus.COMPLETED:
        this.selectedStatus = ReservationStatus.COMPLETED;
        break;
      case ReservationStatus.ACCEPTED:
        this.selectedStatus = ReservationStatus.ACCEPTED;
        break;
    }
  }

  close() {
    this.dialogRef.close();
  }

  onPhoneChange(phoneInput: any) {
    this.form.controls.phone.markAsTouched();
    if (phoneInput.toString().length > 5) {
      this.form.controls.phone.setValue(phoneInput);
    } else {
      this.form.controls.phone.setValue('');
    }
  }
showErrorDatePopup(definedErrorMessage:string){
  if((definedErrorMessage.indexOf('arrivalTime') != -1 &&definedErrorMessage.indexOf('null')!= -1) || (definedErrorMessage.indexOf('departureTime')!= -1&&definedErrorMessage.indexOf('null')!= -1)){
    definedErrorMessage = this.translateService.instant('admin.arrivalDepartureTime.required');
  }
  return definedErrorMessage;
}
  showErrorPopUp(errorMessage: string, error: any) {
    if (error.error && error.error.errors && error.error.errors.length > 0) {
      let definedErrorMessage = error.error.errors[0].message;
      definedErrorMessage = this.showErrorDatePopup(definedErrorMessage);
      this.toasterService.error(definedErrorMessage);
    } else {
      this.toasterService.error(this.translateService.instant(errorMessage));
    }
  }

  addReservation() {
    this.arrivalTime = this.formatDateToISO(this.form.controls.startTime.value);
    this.departureTime = this.formatDateToISO(this.form.controls.endTime.value);
    if (this.action != 'UPDATE') {
      this.addReservationRequest = {
       storeId: Number(this.storeId),
        arrivalTime: this.arrivalTime,
        departureTime: this.departureTime,
        numberOfPeople: this.peopleNumberSelected,
        name: this.form.controls.name.value,
        phone: this.form.controls.phone.value,
        email: this.form.controls.email.value,
        status: this.selectedStatus ?? ReservationStatus.REQUESTED,
        location: this.reservationSquare?.tableId ? { id: this.reservationSquare?.tableId } : null,
        comment: this.form.controls.notes.value,
        occasion: '',
        reason: ''
      };
      this.storeService.addNewReservation(this.addReservationRequest).subscribe((result) => {
        this.dialogRef.close({ loadPage: true });
      }, (error) => {
        this.showErrorPopUp('admin.store.failReservation', error);
      });
    } else {
      this.updateReservationRequest = {
       id: this.reservation.id,
        storeId: Number(this.storeId),
        arrivalTime: this.arrivalTime,
        departureTime: this.departureTime,
        numberOfPeople: this.peopleNumberSelected,
        name: this.form.controls.name.value,
        phone: this.form.controls.phone.value,
        email: this.form.controls.email.value,
        status: this.selectedStatus ?? ReservationStatus.REQUESTED,
        location: this.reservationSquare?.tableId ? { id: this.reservationSquare?.tableId } : null,
        comment: this.form.controls.notes.value,
        occasion: '',
        reason: ''
      };  
      this.storeService.updateReservation(this.updateReservationRequest).subscribe((result) => {
        this.router.navigateByUrl(`/manager/stores/${this.storeId}/reservations`);
        this.dialogRef.close();

      }, (error) => {
        this.showErrorPopUp('admin.store.failReservation', error);
      });
    }

  }

  helper = {
    focusTextArea: (element: HTMLElement) => {
      element.querySelector('textarea')?.focus();
    }
  };

  getCountryCode() {
    return this.selectedStore?.address?.country?.phoneCode;
  }
}
