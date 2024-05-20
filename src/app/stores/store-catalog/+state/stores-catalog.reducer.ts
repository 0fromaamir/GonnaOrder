import { StoreCatalog, SaveOfferView, SaveCategoryView, SaveStationResponse } from '../stores-catalog';
import { StoresCatalogAction, StoresCatalogActionType } from './stores-catalog.actions';
import { combineReducers } from '@ngrx/store';
import { Availability } from '../../stores';
import { StoresAction, StoresActionType } from '../../+state/stores.actions';


export interface CatalogList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: StoreCatalog;
  errorMessage: any;
  selectedCatalogIds: number[];
}
export interface CatalogState {
  catalog: Catalog;
}

export interface Catalog {
  cataloglist: CatalogList;
}

export const catalogInitialState: Catalog = {
  cataloglist: {
    status: 'INITIAL',
    data: null,
    errorMessage: '',
    selectedCatalogIds: []
  }
};


export function cataloglist(state: CatalogList = catalogInitialState.cataloglist, action: StoresCatalogAction|StoresAction): CatalogList {
  switch (action.type) {
    case StoresActionType.LoadStore:
      return{...catalogInitialState[''], status: 'LOADING'};
    case StoresActionType.LoadStoreFailed:
      return{...catalogInitialState['']};
    case StoresCatalogActionType.LoadCatalog:
      return { ...state, status: 'LOADING' };
    case StoresCatalogActionType.LoadCatalogSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: {...state.data, ...action.catalog},
        errorMessage: '',
        selectedCatalogIds: state.selectedCatalogIds ? state.selectedCatalogIds : []
      };
    case StoresCatalogActionType.LoadStation:
      return { ...state, status: 'LOADING' };
    case StoresCatalogActionType.LoadStationSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: { ...state.data, stations: [...action.stations] }
      }
    case StoresCatalogActionType.VerifyCatalogDataSuccess:
    case StoresCatalogActionType.VerifyCatalogImageSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: {...state.data, ...action.catalog},
        errorMessage: ''
      };
    case StoresCatalogActionType.LoadCatalogFailed:
      return { ...catalogInitialState[''], status: 'FAILED' };
    case StoresCatalogActionType.VerifyCatalogDataFailed:
      return { ...catalogInitialState[''], status: 'FAILED' };
    case StoresCatalogActionType.BulkOfferChangeStatusSuccess:
      return {...state, selectedCatalogIds: action.selectedCatalogIds};
    case StoresCatalogActionType.DeleteMultipleOfferSuccess:
      return {...state, selectedCatalogIds: action.selectedCatalogIds};
    default:
      return state;
  }
}


const reducerCatalog: (state: Catalog, action: StoresCatalogAction) => Catalog = combineReducers({
  cataloglist
});

export function storesCatalogReducer(state: Catalog = catalogInitialState, action: StoresCatalogAction): Catalog {
  return reducerCatalog(state, action);
}
/**
 * Offer related reducer start
 */
export interface OfferState {
  offer: Offer;
}

export interface Offer {
  offerDetails: SaveOfferList;
  imageUrl: string;
  availability: Availability;
}
export interface SaveOfferList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: SaveOfferView;
  errorMessage: any;
}
export const OfferInitialState: Offer = {
  offerDetails: {
    status: 'INITIAL',
    data: null,
    errorMessage: ''
  },
  imageUrl: '',
  availability: null
};

export function offerDetails(state: SaveOfferList = OfferInitialState.offerDetails, action: StoresCatalogAction): SaveOfferList {
  switch (action.type) {
    case StoresCatalogActionType.LoadOffer:
      return { ...state, status: 'LOADING' };
    case StoresCatalogActionType.LoadOfferSuccess:
      return {
        status: 'LOADED',
        data: action.offerView,
        errorMessage: ''
      };
    case StoresCatalogActionType.LoadOfferFailed:
      return { ...OfferInitialState[''], status: 'FAILED' };
    default:
      return state;
  }
}

export function imageUrl(state: string = OfferInitialState.imageUrl, action: StoresCatalogAction): string {

  switch (action.type) {
    case StoresCatalogActionType.UploadOfferImageSuccess:
      return action.imageUrl;
    case StoresCatalogActionType.LoadOfferSuccess:
      return action.offerView.standardImage;
    case StoresCatalogActionType.UploadOfferOrCategoryImageFailed:
      return { ...OfferInitialState[''], status: 'FAILED' };
    default:
      return state;
  }
}

export function availability(state: Availability = OfferInitialState.availability, action: StoresCatalogAction): Availability {

  switch (action.type) {
    case StoresCatalogActionType.SaveAvailabilitySuccess:
      return action.availability;
    case StoresCatalogActionType.SaveAvailabilityFailed:
      return { ...OfferInitialState[''], status: 'FAILED' };
    default:
      return state;
  }
}

const reducerOffer: (state: Offer, action: StoresCatalogAction) => Offer = combineReducers({
  offerDetails,
  imageUrl,
  availability
});

export function storeOfferReducer(state: Offer = OfferInitialState, action: StoresCatalogAction): Offer {
  return reducerOffer(state, action);
}
/**
 * Offer related reducer end
 */
export interface CategoryState {
  category: Category;
}

export interface Category {
  categoryDetails: SaveCategoryList;
  imageUrl: string;
}
export interface SaveCategoryList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: SaveCategoryView;
  errorMessage: any;
  stationData: SaveStationResponse;
}

export const CategoryInitialState: Category = {
  categoryDetails: {
    status: 'INITIAL',
    data: null,
    errorMessage: '',
    stationData: null
  },
  imageUrl: ''
};

export function categoryDetails(
  state: SaveCategoryList = CategoryInitialState.categoryDetails, action: StoresCatalogAction): SaveCategoryList {
  switch (action.type) {
    case StoresCatalogActionType.LoadCategory:
      return { ...state, status: 'LOADING' };
    case StoresCatalogActionType.LoadCategorySuccess:
      return {
        status: 'LOADED',
        data: action.categoryView,
        errorMessage: '',
        stationData: state.stationData
      };
    case StoresCatalogActionType.LoadCategoryFailed:
      return { ...CategoryInitialState[''], status: 'FAILED' };
    case StoresCatalogActionType.LoadStationCategory:
      return {...state, status: 'LOADING'};
    case StoresCatalogActionType.LoadStationCategorySuccess:
      return {
        ...state,
        status: 'LOADED',
        stationData: action.station,
        errorMessage: '',
      }
    case StoresCatalogActionType.LoadStationCategoryFailed:
      return {...CategoryInitialState[''], status: 'FAILED'}
    default:
      return state;
  }
}

export function categoryImageUrl(state: string = OfferInitialState.imageUrl, action: StoresCatalogAction): string {
  switch (action.type) {
    case StoresCatalogActionType.UploadCategoryImageSuccess:
      return action.imageUrl;
    case StoresCatalogActionType.LoadCategorySuccess:
      return action.categoryView.standardImage;
    case StoresCatalogActionType.UploadOfferOrCategoryImageFailed:
      return { ...OfferInitialState[''], status: 'FAILED' };
    default:
      return state;
  }
}

const reducerCategory: (state: Category, action: StoresCatalogAction) => Category = combineReducers({
  categoryDetails,
  imageUrl: categoryImageUrl
});

export function storeCategoryReducer(state: Category = CategoryInitialState, action: StoresCatalogAction): Category {
  return reducerCategory(state, action);
}
