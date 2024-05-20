import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadCategory, LoadStation, LoadStationCategory } from './+state/stores-catalog.actions';

@Injectable({
    providedIn: 'root'
})
export class StoreCategoryGuard {

    constructor(private stores: Store<any>) { }

    canActivate(route: ActivatedRouteSnapshot) {
        const categoryId = route.params.categoryId;
        const storeId = route.params.id;
        const catalogId = route.params.catalogId;
        const stationId = route.params.stationId;
        this.stores.dispatch(new LoadStation(storeId));
        if (categoryId !== 'CREATE_CATEGORY') {
            this.stores.dispatch(new LoadCategory(categoryId, storeId, catalogId));
        }
        if(stationId && stationId != 'createStation'){
            this.stores.dispatch(new LoadStationCategory(stationId, storeId))
        }
        return true;
    }

}
