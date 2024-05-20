import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../../+state/stores.reducer';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DisconnectPowersoft, PowersoftLogin, SynchronizePowersoftCatalog, UpdateStoreSettings } from '../../+state/stores.actions';
import { getSelectedStore } from '../../+state/stores.selectors';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ClientStore } from '../../stores';
//import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
// import { format } from 'path';

@Component({
  selector: 'app-store-integrations-powersoft',
  templateUrl: './store-integrations-powersoft.component.html',
  styleUrls: ['./store-integrations-powersoft.component.scss']
})
export class StoreIntegrationsPowersoftComponent implements OnInit {
  private destroy$ = new Subject();
  public showFields: boolean;
  public powersoftConnected: boolean;
  public powersoftForm: FormGroup;
  public powersoftAccessTokenID: boolean;
  public powersoftAgentCodeID: boolean;
  public powersoftGenercCustomerCodeID: boolean;
  public powersoftGenercCustomerEmailID: boolean;
  public powersoftStoreCodeID: boolean;
  public powersoftStationCodeID: boolean;
  public powesoftPriceReferenceID: boolean;
  public powersoftHospitalityModeID: boolean;
  selectedStore: ClientStore;
  helpUrl: string;
  prices: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(private store: Store<StoresState>, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.helpUrl = 'powersoft';
    this.powersoftForm = this.fb.group({
      POWERSOFT_ACCESS_TOKEN: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      POWERSOFT_AGENT_CODE: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      POWERSOFT_GENERIC_CUSTOMER_CODE: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      POWERSOFT_GENERIC_CUSTOMER_EMAIL: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      POWERSOFT_STORE_CODE: ['', Validators.maxLength(100)],
      POWERSOFT_STATION_CODE: ['', Validators.maxLength(100)],
      POWERSOFT_PRICE_REFERENCE: [1],
      POWERSOFT_HOSPITALITY_MODE: ['True']
    });
    this.store.pipe(
      select(getSelectedStore),
      filter(s => s && s.id !== -1),
      takeUntil(this.destroy$)
  ).subscribe(s => {
    this.selectedStore = s;
    if (s.settings.POWERSOFT_ACCESS_TOKEN && s.settings.POWERSOFT_AGENT_CODE &&
        s.settings.POWERSOFT_GENERIC_CUSTOMER_CODE && s.settings.POWERSOFT_GENERIC_CUSTOMER_EMAIL) {
        this.powersoftForm.patchValue(s.settings, {emitEvent: false});
        this.powersoftConnected = true;
        this.powersoftAccessTokenID = s.settings.POWERSOFT_ACCESS_TOKEN;
        this.powersoftAgentCodeID = s.settings.POWERSOFT_AGENT_CODE;
        this.powersoftGenercCustomerCodeID = s.settings.POWERSOFT_GENERIC_CUSTOMER_CODE;
        this.powersoftGenercCustomerEmailID = s.settings.POWERSOFT_GENERIC_CUSTOMER_EMAIL;
        this.powersoftStoreCodeID = s.settings.POWERSOFT_STORE_CODE;
        this.powersoftStationCodeID = s.settings.POWERSOFT_STATION_CODE;
        this.powesoftPriceReferenceID = s.settings.POWERSOFT_PRICE_REFERENCE;
        this.powersoftHospitalityModeID = s.settings.POWERSOFT_HOSPITALITY_MODE;
      } else{
        this.powersoftConnected = false;
        this.powersoftAccessTokenID = false;
        this.powersoftAgentCodeID = false;
        this.powersoftGenercCustomerCodeID = false;
        this.powersoftGenercCustomerEmailID = false;
        this.powersoftStoreCodeID = false;
        this.powersoftStationCodeID = false;
        this.powersoftHospitalityModeID = false;
      }
  });
  }

  onPowersoftClicked() {
    this.showFields = true;
  }
  connect() {
    this.powersoftForm.markAllAsTouched();
    if (this.powersoftForm.valid) {
      const form = this.powersoftForm.getRawValue();
      const rawForm = {
        accessToken: form.POWERSOFT_ACCESS_TOKEN,
        agentCode: form.POWERSOFT_AGENT_CODE,
        genericCustomerCode: form.POWERSOFT_GENERIC_CUSTOMER_CODE,
        genericCustomerEmail: form.POWERSOFT_GENERIC_CUSTOMER_EMAIL,
        storeCode: form.POWERSOFT_STORE_CODE,
        stationCode: form.POWERSOFT_STATION_CODE,
        priceReference: form.POWERSOFT_PRICE_REFERENCE,
        hospitalityMode: form.POWERSOFT_HOSPITALITY_MODE
      };
      this.store.dispatch(new PowersoftLogin(this.selectedStore.id, rawForm));
    }
  }

  disconnect() {
    const form = {
      POWERSOFT_ACCESS_TOKEN: null,
      POWERSOFT_AGENT_CODE: null,
      POWERSOFT_GENERIC_CUSTOMER_CODE: null,
      POWERSOFT_GENERIC_CUSTOMER_EMAIL: null,
      POWERSOFT_STORE_CODE: null,
      POWERSOFT_STATION_CODE: null,
      POWERSOFT_HOSPITALITY_MODE: null
    };
    this.store.dispatch(new DisconnectPowersoft(this.selectedStore.id));
  }

  onDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getControl(name: string) {
    return this.powersoftForm.get(name);
  }

  synchronizeCatalog(): void {
    this.store.dispatch(new SynchronizePowersoftCatalog(this.selectedStore.id));
  }

}
