import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input, OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Reservation} from '../reservation-models/reservation';
import {EventData} from '../reservation-models/eventData';
import {ReservationSquare} from '../reservation-models/reservationSquare';
import {Router} from '@angular/router';
import {StoresScheduleService} from '../../store-schedule/stores-schedule.service';

@Component({
  selector: 'app-reservation-timesheet',
  templateUrl: './reservation-timesheet.component.html',
  styleUrls: ['./reservation-timesheet.component.scss']
})
export class ReservationTimesheetComponent implements AfterViewInit {
  @Input()
  eventData!: EventData[];
  @Input()
  tables!: string[];
  currentTime = new Date();
  availableHours = [];
  squares = [];
  @ViewChild('greenLine') greenLine: ElementRef | undefined;
  startTimes: string[];
  endTimes: string[];
  @Input()
  storeID = 0;
  @Input()
  selectedStore:any;
  start: '';
  end: '';
  @Output() reservationEmitter = new EventEmitter<ReservationSquare>();
  @Output() currentPositionEmitter = new EventEmitter<Number>();
  availableToView = true;
  availableEndHour = '';
  availableStartHour = '';
  startOfDay = new Date();
  endOfDay = new Date();
  isGreenLineShow: boolean;
  constructor(private router: Router, private storeScheduleService: StoresScheduleService, private cd: ChangeDetectorRef) {
  }

   ngAfterViewInit() {
     this.getOpeningTimes();
  }

   getOpeningTimes() {
    this.storeScheduleService.getSpecialSchedule('OPENING_HOURS', Number(this.storeID)).subscribe((value) => {
      if (value[0] != null) {
        this.availableStartHour = value[0].schedule.availabilities[0].startTime ?? '00:00:00';
        this.availableEndHour =  value[0].schedule.availabilities[0].endTime ?? '23:00:00';
        this.availableHours = this.getHoursBetween( this.availableStartHour , this.availableEndHour );
        this.squares = new Array(this.availableHours.length * 4);
        this.cd.detectChanges();
        this.startTimes = this.getSquareStartTimes(this.squares);

      }
      else{
        this.availableHours = this.getHoursBetween( '00:00:00',  '23:00:00');
        this.squares = new Array(this.availableHours.length * 4);
        this.cd.detectChanges();
        this.startTimes = this.getSquareStartTimes(this.squares);
      }
      this.startOfDay.setHours(this.availableHours[0] != null && this.availableHours[0].split(':')[0] != null ? Number(this.availableHours[0].split(':')[0]) : 0, 0, 0, 0);
      this.startOfDay.setMinutes(this.availableHours[0] != null && this.availableHours[0].split(':')[1] != null ? Number(this.availableHours[0].split(':')[1]) : 0);
      this.endOfDay.setHours(this.availableHours[this.availableHours.length - 1].split(':')[0] != null ? Number(this.availableHours[this.availableHours.length - 1].split(':')[0]) : 0, 0, 0, 0);
      this.endOfDay.setMinutes(this.availableHours[this.availableHours.length - 1].split(':')[0] != null ? 59 : 0);
      this.isGreenLineShow = (this.currentTime.getTime() >= this.startOfDay.getTime()) && (this.currentTime.getTime() <= this.endOfDay.getTime());
      this.cd.detectChanges();
    });
  }


  isShowReservation(reservation: Reservation){
    let arrivalTime = new Date(reservation.arrivalTime.split('.')[0]);
    let now = new Date();
    let newDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      arrivalTime.getHours(),
      arrivalTime.getMinutes(),
      arrivalTime.getSeconds()
    ).getTime();
    return (newDate >= this.startOfDay.getTime()) && (newDate <= this.endOfDay.getTime());
  }
  reservedInterval(reservation: Reservation): number {
    const arrivalTime = new Date(reservation.arrivalTime.split('.')[0]).getTime();
    const departureTime = new Date(reservation.departureTime.split('.')[0]).getTime();
    const difference = departureTime - arrivalTime;
    const intervals = difference / (15 * 60 * 1000);
    return (intervals + 1) * 35.5;
  }

  count15MinsFromZero(reservation: Reservation): number {
    const arrivalDate = new Date(reservation.arrivalTime.split('.')[0]);
    const startOfDay = new Date(arrivalDate);
    startOfDay.setHours(this.availableHours[0] != null && this.availableHours[0].split(':')[0] != null ? Number(this.availableHours[0].split(':')[0]) : 0, 0, 0, 0);
    const difference = arrivalDate.getTime() - startOfDay.getTime();
    const intervals = difference / (15 * 60 * 1000);
    return intervals * 35;
  }

  getCurrentTimePosition() {
    const difference = this.currentTime.getTime() - this.startOfDay.getTime();
    const intervals = difference / (15 * 60 * 1000);
    this.currentPositionEmitter.emit(intervals * 30);
    return intervals * 35;
  }

  getSquareStartTimes(squares: any[]) {
    let startTime = Number(this.availableHours[0].split(':')[0]) * 60;
    const interval = 15;
    const startTimes: string[] = [];
    for (let i = 0; i < squares.length; i++) {
      const hours = Math.floor(startTime / 60);
      const minutes = startTime % 60;

      const formattedTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
      startTimes.push(formattedTime);

      startTime += interval;
    }
    return startTimes;
  }

  alertStartTime(index: number, tableId: number, label: string) {
    const reservationSquare: ReservationSquare = {tableId, label, startTime: this.startTimes[index]};
    this.reservationEmitter.emit(reservationSquare);
  }

  navigateToDetails(reservation: Reservation) {
    this.router.navigateByUrl(`/manager/stores/${reservation.storeId}/reservations/details`, {
      state: {
        reservation,
        locations: this.tables,
        selectedStore: this.selectedStore
      }
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

}
