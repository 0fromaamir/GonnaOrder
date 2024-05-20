import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-open-time-modal',
  templateUrl: './open-time-modal.component.html',
  styleUrls: ['./open-time-modal.component.scss'],
})
export class OpenTimeModalComponent implements OnInit {
  open = false;
  openTimeSchedule: any;
  @Input() openTimeModal: Subject<any>;
  @Input() isClosedForOrdering = false;

  ngOnInit(): void {
    this.openTimeModal?.subscribe((openTimeSchedule) => {
      this.openTimeSchedule = openTimeSchedule;
      this.open = true;
    });
  }

  onCheckOutsideClose() {
    this.open = false;
  }
}
