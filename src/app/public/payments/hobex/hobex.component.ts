import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ScriptLoaderService} from "../../script-loader.service";

@Component({
  selector: 'app-hobex',
  templateUrl: './hobex.component.html',
  styleUrls: ['./hobex.component.scss']
})
export class HobexComponent implements OnInit, OnDestroy {

  @Input() returnUrl: string;
  @Input() paymentWidgetScriptUrl: string;
  paymentWidgetScriptId:string = 'hobex-checkout-payment';

  constructor(private scriptLoaderService: ScriptLoaderService) { }

  ngOnInit(): void {
    this.removeScriptForComponent();
    this.loadScriptForComponent();
  }

  ngOnDestroy(): void {
    // Remove the script and associated function when the component is destroyed
    this.removeScriptForComponent();
  }

  private loadScriptForComponent(): void {
    this.scriptLoaderService.loadScript(this.paymentWidgetScriptUrl, this.paymentWidgetScriptId)
    .then(() => {
      console.log('Script loaded for the component', this.paymentWidgetScriptUrl);
    })
    .catch((error) => {
      console.error(`Error loading script:${this.paymentWidgetScriptUrl}`, error, );
    });
  }

  private removeScriptForComponent(): void {
    // Remove the script element from the DOM
    this.scriptLoaderService.removeScriptById(this.paymentWidgetScriptId)
  }

}
