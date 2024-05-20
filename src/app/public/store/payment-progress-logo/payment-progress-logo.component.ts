import {Component, OnDestroy, OnInit} from '@angular/core';
import {ScriptLoaderService} from "../../script-loader.service";

@Component({
  selector: 'app-payment-progress-logo',
  templateUrl: './payment-progress-logo.component.html',
  styleUrls: ['./payment-progress-logo.component.scss']
})
export class PaymentProgressLogoComponent implements OnInit, OnDestroy {

  SCRIPT_PATH: string = 'assets/payment-progress-logo.js';

  constructor(private scriptLoaderService: ScriptLoaderService) { }

  ngOnInit(): void {
    this.loadScriptForComponent();
  }

  ngOnDestroy(): void {
    // Remove the script and associated function when the component is destroyed
    this.removeScriptForComponent();
  }

  private loadScriptForComponent(): void {
    this.scriptLoaderService.loadScript(this.SCRIPT_PATH)
    .then(() => {
      console.log('Script loaded for the component', this.SCRIPT_PATH);
    })
    .catch((error) => {
      console.error(`Error loading script:${this.SCRIPT_PATH}`, error, );
    });
  }

  private removeScriptForComponent(): void {
    // Remove the script element from the DOM
    this.scriptLoaderService.removeScript(this.SCRIPT_PATH)
  }
}
