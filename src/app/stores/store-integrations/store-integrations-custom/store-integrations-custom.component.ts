import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CustomEndPointValidate } from '../../+state/stores.actions';
import { getCustomEndpoint } from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-store-integrations-custom',
  templateUrl: './store-integrations-custom.component.html',
  styleUrls: ['./store-integrations-custom.component.scss']
})
export class StoreIntegrationsCustomComponent implements OnInit, OnDestroy {
  domainForm: FormGroup;
  @Input() storeId: number;
  unsubscribe$: Subject<void> = new Subject<void>();
  prevCustomEndpointUrl = '';
  helpUrl: string;

  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
  ) { }

  ngOnInit(): void {
    this.helpUrl = 'customIntegration';
    const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    this.domainForm = this.fb.group({
      customEndpoint: ['', Validators.compose([
        Validators.maxLength(254),
        Validators.pattern(urlRegex)
      ])]
    });

    this.store.pipe(
      select(getCustomEndpoint),
      takeUntil(this.unsubscribe$)
    ).subscribe(res => {
      if (!!res && !!res.customEndpointURL) {
        this.prevCustomEndpointUrl = res.customEndpointURL;
        this.getControl('customEndpoint').setValue(res.customEndpointURL, { emitEvent: false });
      }
    });

    this.store.dispatch(
      new CustomEndPointValidate(this.storeId, 'get', null)
    );
  }

  getControl(name: string) {
    return this.domainForm?.get(name);
  }

  updateDomain() {
    this.domainForm.markAllAsTouched();
    const endpoint = this.getControl('customEndpoint').value;
    if (!!this.getControl('customEndpoint') &&
      (this.prevCustomEndpointUrl !== endpoint) &&
      !this.getControl('customEndpoint').errors) {
      this.store.dispatch(
        new CustomEndPointValidate(this.storeId, (endpoint !== '') ? 'post' : 'delete', { endpoint })
      );
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
