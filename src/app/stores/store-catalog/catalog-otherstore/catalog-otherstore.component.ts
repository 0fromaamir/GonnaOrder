import { ImportCatalogFromOtherStore } from './../+state/stores-catalog.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { StoresCatalogService } from './../stores-catalog.service';
import { getSelectedStoreRelation } from './../../+state/stores.selectors';
import { StoresState } from './../../+state/stores.reducer';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, throwError } from 'rxjs';
import { CatalogState } from 'src/app/public/store/+state/stores.reducer';
import { ImportCatalog } from '../+state/stores-catalog.actions';
import { StoresListComponent } from '../../stores-list/stores-list.component';
import { ClientStore, Relation } from '../../stores';
import { LoggedInUser } from 'src/app/auth/auth';
import { StoresCatalogActionType } from '../+state/stores-catalog.actions';

@Component({
  selector: 'app-catalog-otherstore',
  templateUrl: './catalog-otherstore.component.html',
  styleUrls: ['./catalog-otherstore.component.scss']
})
export class CatalogOtherstoreComponent implements OnInit, OnDestroy {
  storeId: any;
  private destroyed$ = new Subject();

  constructor(
    private actRoute: ActivatedRoute,
    private catalogService: StoresCatalogService,
    private toastr: ToastrService,
    private translateSer: TranslateService,
    private catalog: Store<CatalogState>,
    ) { }

  ngOnInit() {
    const params = this.actRoute.params as any;
    this.storeId = params._value.id;
  }

  cloneCatalogFromOtherStore(store) {
    this.catalog.dispatch(new ImportCatalogFromOtherStore({
      fromStore: store.id,
      toStore: this.storeId,
      override: false
    }));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
