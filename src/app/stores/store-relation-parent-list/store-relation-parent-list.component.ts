import { Observable, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../+state/stores.reducer';
import { getSelectedStore, getSelectedStoreRelation } from '../+state/stores.selectors';
import { UpdateStoreRelation } from '../+state/stores.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UserState } from 'src/app/user/+state/user.reducer';
import { LoggedInUser } from 'src/app/auth/auth';
import { LocalStorageService } from 'src/app/local-storage.service';
import { ClientStore, Relation, StoreRelationRequest } from '../stores';

@Component({
  selector: 'app-stores-relation-parent-list',
  templateUrl: './store-relation-parent-list.component.html'
})
export class StoreRelationParentListComponent implements OnInit, OnDestroy {

  storeRelation$: Observable<any>;
  stores$: Observable<any>;
  stores: any;
  locale: string;
  timezone: string;
  private destroy$ = new Subject();


  tagVisible$: Observable<boolean>;
  aliasName: string;
  loggedInUser: LoggedInUser;
  selectedStoreRelation: Relation;
  isParentStoreList = true;
  hasParentStoreLinked = false;
  selectedStore: ClientStore;
  multistoreStoreFlag = false;

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    this.storeRelation$ = this.store.pipe(
      select(getSelectedStoreRelation),
      takeUntil(this.destroy$)
    );

    this.storeRelation$.subscribe((relation) => {
      this.selectedStoreRelation = relation;
      this.hasParentStoreLinked = this.selectedStoreRelation
                                  && this.selectedStoreRelation.parentStore
                                  && this.selectedStoreRelation.parentStore.storeId
                                  && this.selectedStoreRelation.parentStore.storeId > 0;
    });
    this.stores$ = this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$)
    );
    this.stores$.subscribe((selectedStore) => {
      this.selectedStore = selectedStore;
      console.log('tree - selected store ', this.selectedStore);
      if ( this.selectedStore.relation && ((this.selectedStore.relation.parentStore && this.selectedStore.relation.parentStore.storeId > 0)
           ||  (this.selectedStore.relation.childStores && this.selectedStore.relation.childStores.length > 0)) ) {
       this.multistoreStoreFlag = true;
      }
      else{
        this.multistoreStoreFlag = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupRelation(){

  }
  selectedParentStore(store){
    if (store && store.id){
      const req: StoreRelationRequest = { isIndependent:	!!this.selectedStore.isIndependent,
        parentStoreId:	store.id};
      const parentStoreDetails = {
        name : store.name,
        alias : store.aliasName
      };
      console.log('store Relation ship update request ', req);
      this.store.dispatch(new UpdateStoreRelation(req, parentStoreDetails, this.hasParentStoreLinked));
    }
  }
}
