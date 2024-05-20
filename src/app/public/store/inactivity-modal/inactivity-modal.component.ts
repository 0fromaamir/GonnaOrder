import {Component, OnInit, HostListener} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-inactivity-modal',
  templateUrl: './inactivity-modal.component.html',
  styleUrls: ['./inactivity-modal.component.scss']
})
export class InactivityModalComponent implements OnInit {
  timeLeft = 45;
  interval;

  constructor(private dialogRef: MatDialogRef<InactivityModalComponent>) {}

  ngOnInit() {
    this.startTimer();
  }


  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 0;
        this.onYesOrNoPress(false);
      }
    }, 1000);
  }

  closeDialog(stillAvailableData: boolean): void {
    this.dialogRef.close(stillAvailableData);
  }

  onYesOrNoPress(stillAvailable: boolean) {
    clearInterval(this.interval);
    this.closeDialog(stillAvailable);
  }
}
