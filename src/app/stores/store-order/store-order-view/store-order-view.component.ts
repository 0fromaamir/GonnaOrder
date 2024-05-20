import { Order, StoreCatalog } from './../../stores';
import { Store, select } from '@ngrx/store';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StoresOrdersState } from '../+state/store-order.reducer';
import { Observable } from 'rxjs';
import { getSelectedOrder } from '../+state/store-order.selector';
import { filter } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { LoadStoreOrder } from '../+state/store-order.actions';

@Component({
  selector: 'app-store-order-view',
  templateUrl: './store-order-view.component.html',
  styleUrls: ['./store-order-view.component.scss']
})
export class StoreOrderViewComponent implements OnInit {
  order$: Observable<Order>;
  @Input() orderId: string;
  @Input() stationId: string;
  @Output() collapseOrder = new EventEmitter();
  isViewScreen: Boolean = true;
  constructor(private store: Store<StoresOrdersState>, private route: ActivatedRoute) { }

  ngOnInit() {
    const id = this.route.snapshot.params.id;
    const orderUuid = this.route.snapshot.params.orderUuid;
    if (!orderUuid) {
      this.isViewScreen = false;
    }
    this.order$ = this.store.pipe(
      select(getSelectedOrder),
      filter(o => o && o.uuid !== '')
    );
  }

  collapseOrderFunc() {
    this.collapseOrder.emit();
  }

}
