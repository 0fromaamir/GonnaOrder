import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';

import {Reservation} from '../reservation-models/reservation';
import {Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {getSelectedStore} from '../../+state/stores.selectors';
import {filter, map} from 'rxjs/operators';
import {StoreService} from '../../../public/store/store.service';
import {BreakpointObserver, Breakpoints, LayoutModule} from '@angular/cdk/layout';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reservation-tabs',
  templateUrl: './reservation-tabs.component.html',
  styleUrls: ['./reservation-tabs.component.scss'],
})
export class ReservationTabsComponent implements OnInit{
@Input()statusTab: string;
@Input()storeId: string;
@Input()selectedStore: any;
totalPages = 0;
reservations: Reservation[] = [];
  storeLocaleTimeZone$: Observable<{ locale: string; timezone: string; }>;
  isJapanese = false;
  selectedReservation = 0;
  constructor(private store: Store<any>, private storeService: StoreService, private cd: ChangeDetectorRef,
              private breakpointObserver: BreakpointObserver, private router: Router) { }

  isMediumScreen$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 768px)')
    .pipe(
      map(result => result.matches)
    );
  ngOnInit(): void {
      this.getReservations(this.storeId, this.statusTab);
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
  }
  getDateFormat(dateToFormat: string) {
    const arrivalDate = new Date(dateToFormat.split('.')[0]);
    return arrivalDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  }
  onSelectReservation(id: number){
    if (this.selectedReservation == id){
      this.selectedReservation = 0;
    }
    else {
      this.selectedReservation = id;
    }
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

  getTimeFormat(timeToFormat: string){
    return timeToFormat.split('T')[1].split('.')[0];
  }
onChangesOccured(isChanged: boolean, reservationGiven: Reservation){
  const index = this.reservations.findIndex((reservation) => reservation.id === reservationGiven.id);
  if (index !== -1 && index < this.reservations.length - 1) {
    this.selectedReservation = this.reservations[index + 1].id;
  } else{
    this.selectedReservation = this.reservations[this.reservations.length - 2].id;
  }
  this.reservations = this.reservations.filter((reservation) => reservation.id != reservationGiven.id);
  this.cd.detectChanges();
}
  getReservations(storeId: string, status?: string, taleId?: number, name?: string, reservationNumber?: string,
                  sortCreatedAt?: string, sortArrivalTime?: string, arrivalDate?: string,
                  offset?: number, limit?: number) {
    this.storeService.getStoreReservations(storeId, status, taleId, name, reservationNumber, "DESC",
      sortArrivalTime, arrivalDate, offset, limit).subscribe((result) => {
      result.content.forEach((resrvation) => {
        this.reservations.push(resrvation);
      });
      if (this.reservations.length != 0)
      { this.selectedReservation = this.reservations[0].id; }
      this.cd.detectChanges();
    });

  }

  navigateToDetails(reservation: Reservation) {
    this.router.navigateByUrl(`/manager/stores/${reservation.storeId}/reservations/details`, {state: {
        reservation,
        backNavigation: this.statusTab
      }});
  }
}
