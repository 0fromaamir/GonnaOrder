import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';
  
/* eslint-disable @angular-eslint/component-selector */
@Component({
  selector: '[go-toast-component]',
  styles: [`
    :host {
      background-color: #48b9b7;
      position: relative;
      overflow: hidden;
      margin: 0 0 6px;
      padding: 10px 10px 10px 10px;
      width: 300px;
      border-radius: 3px 3px 3px 3px;
      color: #FFFFFF;
      pointer-events: all;
      cursor: pointer;
    }
    .btn-pink {
      -webkit-backface-visibility: hidden;
      -webkit-transform: translateZ(0);
    }
  `],
  template: `
  <div class="row" [style.display]="state.value === 'inactive' ? 'none' : ''" (click)="action($event)">
    <div class="col-12">
      <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
        {{ title }}
      </div>
      <div *ngIf="message && options.enableHtml" role="alert" aria-live="polite"
        [class]="options.messageClass" [innerHTML]="message">
      </div>
      <div *ngIf="message && !options.enableHtml" role="alert" aria-live="polite"
        [class]="options.messageClass" [attr.aria-label]="message">
        {{ message }}
      </div>
    </div>
  </div>
  `,
  animations: [
    trigger('flyInOut', [
      state('inactive', style({
        opacity: 0,
      })),
      transition('inactive => active', animate('400ms ease-out', keyframes([
        style({
          transform: 'translate3d(100%, 0, 0) skewX(-30deg)',
          opacity: 0,
        }),
        style({
          transform: 'skewX(20deg)',
          opacity: 1,
        }),
        style({
          transform: 'skewX(-5deg)',
          opacity: 1,
        }),
        style({
          transform: 'none',
          opacity: 1,
        }),
      ]))),
      transition('active => removed', animate('400ms ease-out', keyframes([
        style({
          opacity: 1,
        }),
        style({
          transform: 'translate3d(100%, 0, 0) skewX(30deg)',
          opacity: 0,
        }),
      ]))),
    ]),
  ],
  preserveWhitespaces: false,
})

/* eslint-disable @angular-eslint/component-class-suffix */
export class GoToast extends Toast {
  storeId: number;
  orderUuid: string;

  constructor(protected toastrService: ToastrService,
    public toastPackage: ToastPackage,
    private router: Router) {
    super(toastrService, toastPackage);
  }

  action(event: Event) {
    event.stopPropagation();
    this.remove();
    this.toastPackage.triggerAction();
    if (this.storeId && this.orderUuid) {
      this.router.navigate([`/manager/stores/${this.storeId}/orders`]).then(() => {
        this.router.navigate([`/manager/stores/${this.storeId}/orders/${this.orderUuid}`])
      });
    }
    return false;
  }
}