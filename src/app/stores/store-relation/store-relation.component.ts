import { Observable, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { getSelectedStore, getSelectedStoreRelation } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { LoggedInUser } from 'src/app/auth/auth';
import { ClientStore, Relation, StoreRelationRequest } from '../stores';
import { DeleteStoreParent, UpdateStoreRelation, UpdateStoreSettings } from '../+state/stores.actions';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-stores-relation',
  templateUrl: './store-relation.component.html'
})
export class StoreRelationComponent implements OnInit, OnDestroy {

  stores$: Observable<any>;
  stores: any;
  locale: string;
  timezone: string;
  private destroy$ = new Subject();

  tagVisible$: Observable<boolean>;
  aliasName: string;
  loggedInUser: LoggedInUser;
  selectedStore: ClientStore;
  storeRelation$: Observable<any>;
  selectedStoreRelation: Relation;
  multistoreStoreFlag = false;
  currentRoute = false;
  hasValidParent = false;
  hasChildStores = false;
  independentFlag = false;
  settingsForm: FormGroup = this.fb.group({});
  helpUrlInheritCatalog: string;
  helpUrlInheritSchedules: string;

  constructor(private store: Store<StoresState>,
    private router: Router,
    private fb: FormBuilder) {
    this.router.events.subscribe(event => {
      /*
        Router outlet ends navigation router events before component loaded it is breaking change in Angular 15( https://angular.io/guide/update-to-version-15#routeroutlet-instantiates-the-component-after-change-detection).
        scroll event emits after component is loaded hence we can also check that event which is triggered from app component window.scrollTo(0, 0);

        https://github.com/angular/angular/issues/49996
       */
      if (event instanceof NavigationEnd || event instanceof Scroll) {
        const navigationEndEvent: NavigationEnd = event instanceof NavigationEnd ? event : event.routerEvent;
        this.currentRoute = navigationEndEvent.url.endsWith('relation-tree');
      }
    });

  }

  ngOnInit() {
    this.helpUrlInheritCatalog = 'inheritCatalog';
    this.helpUrlInheritSchedules = 'inheritSchedules';
    this.settingsForm = this.fb.group({
      INHERIT_CATALOG_PARENT_STORE: [''],
      INHERIT_SCHEDULE_PARENT_STORE: [''],
      INHERIT_LOYALTY_PARENT_STORE: ['']
    });

    this.storeRelation$ = this.store.pipe(
      select(getSelectedStoreRelation),
      takeUntil(this.destroy$)
    );
    this.storeRelation$.subscribe((relation) => {
      this.selectedStoreRelation = relation;
      console.log('tree - Selectedstore Relation', this.selectedStoreRelation);
    });
    this.stores$ = this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    );

    this.stores$.subscribe((selectedStore) => {
      this.selectedStore = selectedStore;
      console.log('tree - selected store ', this.selectedStore);
      if (this.selectedStore.relation && ((this.selectedStore.relation.parentStore && this.selectedStore.relation.parentStore.storeId > 0)
        || (this.selectedStore.relation.childStores && this.selectedStore.relation.childStores.length > 0))) {
        this.multistoreStoreFlag = true;
      }
      else {
        this.multistoreStoreFlag = false;
      }
      this.hasValidParent = this.selectedStore.relation
        && this.selectedStore.relation.parentStore && this.selectedStore.relation.parentStore.storeId > 0;
      this.hasChildStores = this.selectedStore.relation
        && this.selectedStore.relation.childStores && this.selectedStore.relation.childStores.length > 0;

      this.settingsForm.get('INHERIT_CATALOG_PARENT_STORE').setValue(selectedStore.settings.INHERIT_CATALOG_PARENT_STORE);
      this.settingsForm.get('INHERIT_SCHEDULE_PARENT_STORE').setValue(selectedStore.settings.INHERIT_SCHEDULE_PARENT_STORE);
      this.settingsForm.get('INHERIT_LOYALTY_PARENT_STORE').setValue(selectedStore.settings.INHERIT_LOYALTY_PARENT_STORE);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupRelation() {
    // this.show
  }

  toggleIndependent(event) {
    const independentFlag = !this.selectedStore?.isIndependent;
    const req: StoreRelationRequest = {
      isIndependent: independentFlag,
      parentStoreId: this.selectedStoreRelation.parentStore.storeId
    };
    const parentStoreDetails = {
      name: this.selectedStoreRelation.parentStore.storeName,
      alias: this.selectedStoreRelation.parentStore.storeAlias
    };
    console.log('store Relation ship update request ', req);
    this.store.dispatch(new UpdateStoreRelation(req, parentStoreDetails, true));
  }

  removeParent() {
    console.log('store Relation ship remove parent ', this.selectedStore?.id);
    this.store.dispatch(new DeleteStoreParent(this.selectedStore?.id));
  }

  onSubmit() {
    const formObj = this.settingsForm.getRawValue();
    this.settingsForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(formObj));
  }
}
