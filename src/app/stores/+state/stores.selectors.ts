import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Stores, Users, ValidateAliasAvailable, initialStoreUserExperience, Customers, CustomEndpoint } from './stores.reducer';
import { ClientStore, StoreOrderItemsStatistics } from '../stores';

export const getStoresState = createFeatureSelector<Stores>('stores');
export const getStoresList = createSelector(getStoresState, (state: Stores) => state.list);
export const getSelectedStore = createSelector(getStoresState, (state: Stores) => state?.selectedStore.store);
export const getSelectedStoreApiStatus = createSelector(getStoresState, (state: Stores) => state.selectedStore.status);
export const getSelectedStoreLocale =
  createSelector(getSelectedStore, (state: ClientStore) => state.address.country.defaultLocale + '-' + state.address.country.code);
export const getSelectedStoreTimezone = createSelector(getSelectedStore, (state: ClientStore) => state.timeZone);

export const getUsersState = createFeatureSelector<Users>('users');
export const getUsersList = createSelector(getUsersState, (state: Users) => state.userList);

export const getInviteUser = createSelector(getUsersState, (state: Users) => state.inviteUser);

export const getStoreImage = createSelector(getStoresState, (state: Stores) => state.selectedStoreImages.imageUrl);
export const getStoreLogo = createSelector(getStoresState, (state: Stores) => state.selectedStoreImages.logoUrl);
export const getStoreBackgroundImage = createSelector(getStoresState, (state: Stores) => state.selectedStoreImages.backgroundImageUrl);
export const getStoreStatistics = createSelector(getStoresState, (state: Stores) => state.statisticsList.statistics);
export const getMenuViewingStatistics = createSelector(getStoresState, (state: Stores) => state.statisticsList.menuViewingStatistics);


export const getAliasAvailability = createFeatureSelector<ValidateAliasAvailable>('validateAliasAvailable');
export const getAliasAvailabilityState =
  createSelector(getAliasAvailability, (state: ValidateAliasAvailable) => state.aliasAvailabilityState.availabilityState);
export const getAliasAvailabilityStatus =
  createSelector(getAliasAvailability, (state: ValidateAliasAvailable) => state.aliasAvailabilityState.status);

export const getStoreNotificationsEnabled = createSelector(getStoresState, (state: Stores) => state.selectedStore.notificationsEnabled);
export const getStoreNotificationSupported = createSelector(getStoresState, (state: Stores) => state.selectedStore.notificationsSupported);

export const getStoreAutoprintEnabled = createSelector(getStoresState, (state: Stores) => state.selectedStore.autoprintEnabled);
export const getStoreAutoprintSupported = createSelector(getStoresState, (state: Stores) => state.selectedStore.autoprintSupported);

export const getStoreZones = createSelector(getStoresState, (state: Stores) => state.zonesList.zones);
export const getStoreZoneStatus = createSelector(getStoresState, (state: Stores) => state.zoneState.status);
export const getStoreZone = createSelector(getStoresState, (state: Stores) => state.zone.zone);
export const getStoreSingleZoneStatus = createSelector(getStoresState, (state: Stores) => state.zone.zoneStatus);

export const getLoadingStoreId = createSelector(getStoresState, (state: Stores) => state.loadingStoreId);
export const getOrderItemsStatisticsList = createSelector(getStoresState, (state: Stores) => state.orderItemsStatisticsList);

export const getStoresUserExperience = createSelector(getStoresState, (state: Stores) => state.storesUserExperience);

export const getSelectedStoreState = createSelector(getStoresState, (state: Stores) => state.selectedStore);

export const getSelectedStoreUserExperience = createSelector(getStoresState, (state: Stores) => {
    if (state.selectedStore.store.id < 0) {
        return initialStoreUserExperience;
    } else {
        return state.storesUserExperience[state.selectedStore.store.id];
    }
});
export const getStoreValidations = createSelector(getStoresState, (state: Stores) => state.validationStatus);

export const getMynextLogin = createSelector(getStoresState, (state: Stores) => state.mynextLogin);

export const getClientStoreByAliasName = createSelector(getStoresState, (state: Stores, props) => state.list.data.find(clientStore => clientStore.aliasName == props.aliasName))

export const getNotificationSubscriptions = createSelector(getStoresState, (state: Stores) => state.notificationSubscriptions);
export const getNotificationSubscriptionsByStoreId = createSelector(getStoresState, (state: Stores, props) => Object.prototype.hasOwnProperty.call(state.notificationSubscriptions, props.storeId));

export const getHubriseLogin = createSelector(getStoresState, (state: Stores) => state.hubriseLogin);
export const getHubriseLogout = createSelector(getStoresState, (state: Stores) => state.hubriseLogout);
export const clearHubriseData = createSelector(getStoresState, (state: Stores) => state.hubriseLogout);

export const getCustomersState = createFeatureSelector<Customers>('customers');
export const getCustomersList = createSelector(getCustomersState, (state: Customers) => state.customersList);
export const getSelectedStoreRelation = createSelector(getStoresState, (state: Stores) => state.selectedStore.store.relation);

export const getCustomEndpointState = createFeatureSelector<CustomEndpoint>('customEndpoint');
export const getCustomEndpoint = createSelector(getCustomEndpointState, (state: CustomEndpoint) => state.customEndpoint);
