import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatDatepicker} from '@angular/material/datepicker';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-custom-datepicker',
  templateUrl: './custom-datepicker.component.html',
  styleUrls: ['./custom-datepicker.component.scss']
})

export class CustomDatepickerComponent implements OnInit{
  @Output() dateChange = new EventEmitter<string>();
  @Input()startDate: string;
  @Input() vAlignment = '';
  @Input() deleteMarginTop: boolean;
  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  displayedDate: Date;
  constructor(private datePipe: DatePipe, private cd: ChangeDetectorRef) {}
  date: Date;
  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  ngOnInit() {
    this.date = (this.startDate!=null && this.startDate !='') ? new Date(this.startDate):new Date();
    if (this.startDate){
      this.displayedDate = this.parseISOString(this.startDate);
      this.date = this.parseISOString(this.startDate);
      this.cd.detectChanges();
    }
  }
  onDateChange(event: any) {
    this.date = new Date(event.value);
    this.dateChange.emit(this.formatDate(this.date));
    this.cd.detectChanges();
  }
  parseISOString(isoDate: string): Date {
    const cleanedIsoDate = isoDate.replace('Z', '');

    const date = new Date(cleanedIsoDate);

    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() + offset);

    return date;
  }
  incrementDate() {
    this.date = new Date(this.date.setDate(this.date.getDate() + 1));
    this.dateChange.emit(this.formatDate(this.date));
    this.cd.detectChanges();
  }

  decrementDate() {
    this.date = new Date(this.date.setDate(this.date.getDate() - 1));
    this.dateChange.emit(this.formatDate(this.date));
    this.cd.detectChanges();
  }

}
