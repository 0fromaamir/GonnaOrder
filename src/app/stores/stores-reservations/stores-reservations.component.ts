import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { helpPage } from '../../shared/help-page.const';
import { initialStoreUserExperience, StoreUserExperience } from '../+state/stores.reducer';
import { Reservation } from './reservation-models/reservation';
import { EventData } from './reservation-models/eventData';
import { StoreService } from '../../public/store/store.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { BookUpdateReservationsComponent } from './book-update-reservations/book-update-reservations.component';
import { ReservationSquare } from './reservation-models/reservationSquare';
import { StoreLocationService } from '../store-location/store-location.service';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-stores-reservations',
  templateUrl: './stores-reservations.component.html',
  styleUrls: ['./stores-reservations.component.scss']
})
export class StoresReservationsComponent implements OnInit {
  @ViewChild('tableContainer', { read: ElementRef }) tableContainer: ElementRef;
  @Input() isViewScreen = true;
  orderDetailsHelpPage = helpPage.Reservation;
  storeUserExperience: StoreUserExperience = { ...initialStoreUserExperience };
  tabState = '';
  storeId = '';
  reservations: Reservation[] = [];
  eventData: EventData[] = [];
  isScrolled = false;
  locations: any[] = [];
  selectedStore: any;
  currentDate = new Date();
  day = String(this.currentDate.getDate()).padStart(2, '0');
  month = String(this.currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  year = this.currentDate.getFullYear();
  dateSelected = this.year + '-' + this.month + '-' + this.day;

  constructor(
    private storeService: StoreService,
    private storeLocationService: StoreLocationService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private store: Store,
    private route: ActivatedRoute
  ) {
    if (history.state) {
      this.tabState = history.state.tabState;
    }
  }

  ngOnInit() {
    this.getStoreId();
    this.tabState = !this.tabState || this.tabState == '' ? 'TIMELINE' : this.tabState;
    this.getTables();

    this.store.pipe(
      select(getSelectedStore),
    ).subscribe(
      selectedStore => {
        this.selectedStore = selectedStore;
      }
    );
  }


  currentPositionChecker(position:number){
    if(!this.isScrolled)
    {
      this.tableContainer.nativeElement.scrollLeft = position;
      this.isScrolled = true;
     }
  }

  getStoreId() {
    this.storeId = this.route.snapshot.paramMap.get('id');
  }

  getTables() {
    this.storeLocationService.list(Number(this.storeId)).subscribe((tables) => {
      this.locations = tables.data;
      this.getReservations(this.storeId, null, null, null, null, null, null, this.dateSelected, null, null);
    });
  }

  getReservations(storeId: string, status?: string, taleId?: number, name?: string, reservationNumber?: string,
    sortCreatedAt?: string, sortArrivalTime?: string, arrivalDate?: string,
    offset?: number, limit?: number) {
    this.storeService.getStoreReservations(storeId, status, taleId, name, reservationNumber, sortCreatedAt,
      sortArrivalTime, arrivalDate, offset, limit).subscribe((result) => {
        result.content.forEach((reservation) => {
          this.reservations.push(reservation);
        });
        this.createEventData(this.groupByLocationTableId(this.reservations));
        this.cd.detectChanges();
      });

  }


  onTabBtnClick(tabName: string) {
    this.tabState = tabName;
  }

  onDateChange(date: string) {
    this.reservations = [];
    this.eventData = [];
    this.dateSelected = date;
    this.getReservations(this.storeId, null, null, null, null, null, null, date, null, null);
  }

  onCreateReservation(action?: string, reservationSquare?: ReservationSquare) {
    reservationSquare = reservationSquare ?? { label: '', tableId: 0, startTime: '' };
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: action ?? 'Add',
      date: this.dateSelected,
      storeId: this.storeId,
      reservationSquare,
      locations: this.locations,
      selectedStore: this.selectedStore
    };
    dialogConfig.panelClass = 'reservation-dialog-overlay';
    const dialogRef = this.dialog.open(BookUpdateReservationsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((res) => {
      if (res && res.loadPage) {
        this.eventData = [];
        this.getReservations(this.storeId, null, null, null, null, null, null, this.dateSelected, null, null);
      }
    });
  }

  addReservationSquare(reservationSquare: ReservationSquare) {
    this.onCreateReservation('CreateFromTable', reservationSquare);
  }

  groupByLocationTableId(reservations: Reservation[]): { [key: string]: Reservation[] } {
    const result: { [key: string]: Reservation[] } = {};
    for (const reservation of reservations) {
      if (reservation.location != null && reservation.location.id != null) {
        const locationTableId = reservation.location.id;
        if (Object.prototype.hasOwnProperty.call(result, locationTableId)) {
          result[locationTableId].push(reservation);
        } else {
          result[locationTableId] = [reservation];
        }
      }
    }
    return result;
  }

  createEventData(reservationsByLocationTableId: { [key: string]: Reservation[] }) {
    for (const location of this.locations) {
      const reservations = reservationsByLocationTableId[location.id];
      if (location) {
        const eventData: EventData = {
          tableId: location.id,
          label: location.label,
          maxCapacity: location.maxCapacity,
          reservations
        };
        this.eventData.push(eventData);
      }
    }
  }

  protected readonly Number = Number;
}
