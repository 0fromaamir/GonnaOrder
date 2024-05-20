import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { helpPage } from '../../../shared/help-page.const';
import { Reservation } from '../reservation-models/reservation';
import { StoreService } from '../../../public/store/store.service';
import { UpdateReservationRequest } from '../reservation-models/UpdateReservationRequest';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BookUpdateReservationsComponent } from '../book-update-reservations/book-update-reservations.component';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ReservationSquare } from '../reservation-models/reservationSquare';
import { ReservationStatus } from '../reservation-models/reservation-status';

import { ViewportScroller } from '@angular/common';
import { selectedStore } from 'src/app/public/store/+state/stores.reducer';
import { ClientStore } from '../../stores';
@Component({
  selector: 'app-reservation-details',
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.scss']
})
export class ReservationDetailsComponent implements OnInit {
  @Input() isViewScreen = true;
  @Input() storeId;
  @Input() reservation: Reservation;
  @Input() embedDetails = true;
  @Input() backNavigation = '';
  @Input() selectedStore: ClientStore;
  @Output() changesOccured = new EventEmitter<boolean>();
  orderDetailsHelpPage = helpPage.Reservation;
  startTime: string;
  endTime: string;
  selectedStatus: string;
  reservationSquare: ReservationSquare;
  addReservationRequest: UpdateReservationRequest = {
    id: 0,
    storeId: 0,
    arrivalTime: '',
    departureTime: '',
    numberOfPeople: 0,
    name: '',
    phone: '',
    email: '',
    location: {},
    status: '',
    comment: '',
    occasion: '',
    reason: ''
  };
  isMobileScreen = false;
  width: [number, number];
  constructor(private storeService: StoreService, private translateService: TranslateService, private toasterService: ToastrService, private router: Router, private dialog: MatDialog, private cd: ChangeDetectorRef) {
    if (history.state.reservation) {
      this.reservation = history.state.reservation;
      this.storeId = this.reservation.storeId;
      this.backNavigation = history.state.backNavigation ?? this.backNavigation;
    }
  }
  ngOnInit() {
  }

  getDateFormat(dateToFormat: string) {
    const arrivalDate = new Date(dateToFormat.split('.')[0]);
    return arrivalDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  }
  navigateWithState() {
    const navigationExtras: NavigationExtras = {
      state: {
        tabState: this.backNavigation
      }
    };

    this.router.navigate(['/manager/stores/' + this.storeId + '/reservations'], navigationExtras);
  }
  getRequestFormat(dateToFormat: string) {
    const requestedDate = new Date(dateToFormat.split('.')[0]);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedParts = formatter.formatToParts(requestedDate);
    const reorderedParts = [
      formattedParts.find(part => part.type === 'hour'),
      { type: 'literal', value: ':' },
      formattedParts.find(part => part.type === 'minute'),
      formattedParts.find(part => part.type === 'weekday'),
      formattedParts.find(part => part.type === 'day'),
      formattedParts.find(part => part.type === 'month')
    ];
    const formattedDate = reorderedParts.map(part => part.value).join(' ');
    return formattedDate.replace(/,/g, '');
  }

  getTimeFormat(timeToFormat: string) {
    return timeToFormat.split('T')[1].split('.')[0];
  }
  showErrorPopUp(errorMessage: string, error: any) {
    if (error.error && error.error.errors && error.error.errors.length > 0) {
      const definedErrorMessage = error.error.errors[0];
      this.toasterService.error(definedErrorMessage);
    } else {
      this.toasterService.error(this.translateService.instant(errorMessage));
    }
  }
  onChangeStatus(status: string) {
    this.selectedStatus = status;
    this.addReservationRequest = {
      id: this.reservation.id,
      storeId: this.reservation.storeId,
      arrivalTime: this.reservation.arrivalTime,
      departureTime: this.reservation.departureTime,
      numberOfPeople: this.reservation.numberOfPeople,
      name: this.reservation.name,
      phone: this.reservation.phone,
      email: this.reservation.email,
      status: this.selectedStatus,
      location: { id: this.reservation?.location?.id },
      comment: this.reservation.comment,
      occasion: this.reservation.occasion,
      reason: this.reservation.reason
    };
    this.storeService.updateReservation(this.addReservationRequest).subscribe((result) => {
    }, (error) => {
      this.showErrorPopUp('admin.store.failReservation', error);
    });
    this.changesOccured.emit(true);
    this.routeBackToTable();
  }
  onDeleteStatus(id: number) {
    this.storeService.deleteReservation(id, this.storeId).subscribe();
    this.changesOccured.emit(true);
    this.routeBackToTable();
  }
  routeBackToTable() {
    this.router.navigateByUrl(`/manager/stores/${this.reservation.storeId}/reservations`);
  }
  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  onDetails(reservation: Reservation, assign?: boolean) {
    this.reservationSquare = { tableId: reservation.location?.id, label: reservation.location?.label, startTime: reservation.arrivalTime };
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'UPDATE',
      storeId: this.storeId,
      reservationSquare: this.reservationSquare,
      selectedStore: this.selectedStore ?? history.state.selectedStore,
      selectedStatus: assign ? ReservationStatus.ASSIGNED : this.capitalizeFirstLetter(reservation.status),
      reservation
    };
    const dialogRef = this.dialog.open(BookUpdateReservationsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res) => {
    });
  }
  navigateToDetails(reservation: Reservation) {
    this.router.navigateByUrl(`/manager/stores/${reservation.storeId}/reservations/details`, {
      state: {
        reservation,
        backNavigation: this.backNavigation
      }
    });
  }
}

