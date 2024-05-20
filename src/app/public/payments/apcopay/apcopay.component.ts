import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-apcopay',
  templateUrl: './apcopay.component.html',
  styleUrls: ['./apcopay.component.scss']
})
export class ApcopayComponent {

  @ViewChild('apcopayPaymentsForm') apcopayPaymentsForm: ElementRef;
  requestJSON: any;

  submitForm(requestJSON: any) {
    this.requestJSON = requestJSON;
    setTimeout(_ => this.apcopayPaymentsForm.nativeElement?.submit());
  }

}
