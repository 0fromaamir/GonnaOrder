import {Component, OnDestroy, OnInit} from '@angular/core';
import {LocationService} from "../../location.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../local-storage.service";
import {interval, Subject} from "rxjs";
import {StoreService} from "../store.service";
import {StoreOrderService} from "../../../stores/store-order/store-order.service";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-payment-progress',
  templateUrl: './payment-progress.component.html',
  styleUrls: ['./payment-progress.component.scss']
})
export class PaymentProgressComponent implements OnInit, OnDestroy {

  private fetchInterval: number = 500;
  private maxTimeout: number = 90000;
  private stopPaymentStatusInterval = false;
  private destroy$ = new Subject<void>();
  private readonly PHYSICAL_PAYMENT_DETAILS = 'physicalPaymentDetails';

  constructor(private locationService: LocationService,
              private router: Router,
              private storageService: LocalStorageService,
              private storeOrderService: StoreOrderService,
              private storeService: StoreService
              ) {
  }


  ngOnInit(): void {
    // Start the initial data fetch
    this.fetchPaymentStatus();

    // Start the interval
    this.startFetchPaymentStatus();

  }

  private startFetchPaymentStatus(): void {
    interval(this.fetchInterval)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.fetchPaymentStatus();
      if (this.stopPaymentStatusInterval) {
        this.stopFetchPaymentStatus();
      }
    });

    // Set a timeout to stop polling after the maximum timeout
    setTimeout(() => {
      this.stopFetchPaymentStatus();
    }, this.maxTimeout);
  }

  private stopFetchPaymentStatus(): void {
    const { redirectUrl } = this.getPhysicalPaymentDetails();
    this.stopPaymentStatusInterval = true;
    this.destroy();
    window.location.href = redirectUrl;
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  private destroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private fetchPaymentStatus() {
    const physicalPaymentDetails = this.getPhysicalPaymentDetails();
    const { storeId, orderId, isStandalonePayment, redirectUrl } = physicalPaymentDetails;

    if (isStandalonePayment) {
      this.storeService.getStandaloneOrderPayment(storeId, orderId).subscribe((res) => {
        this.validatePaymentStatus(res.paymentStatus, redirectUrl);
      });
    } else {
      this.storeOrderService.get(storeId, orderId).subscribe((order) => {
        this.validatePaymentStatus(order.paymentStatus, redirectUrl);
      });
    }
  }

  private getPhysicalPaymentDetails() {
    const physicalPaymentDetailsStr = this.storageService.getSavedState(this.PHYSICAL_PAYMENT_DETAILS);
    return JSON.parse(physicalPaymentDetailsStr);
  }

  private validatePaymentStatus(paymentStatus, redirectUrl) {
    if (paymentStatus != 'IN_PROGRESS') {
      this.storageService.removeSavedState(this.PHYSICAL_PAYMENT_DETAILS);
      this.stopPaymentStatusInterval = true;
      window.location.href = redirectUrl;
    }
  }
}
