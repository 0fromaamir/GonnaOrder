import { ClientStore, LocationValid, Order, OrderMeta, PresetOrderData } from 'src/app/stores/stores';
import { OrderUpdateRequest } from '../types/OrderUpdateRequest';

export default class OrderUtils {
    // disable location validation as discussed via Slack...
    static mapOrderMetadataToOrderUpdateRequest(
        orderMetadata: OrderMeta,
        uiLanguageLocale: string,
        validLocations: LocationValid,
        selectedLang: string
    ): OrderUpdateRequest {
        const obj: OrderUpdateRequest = {
            catalogLanguageLocale: 'en',
            uiLanguageLocale: uiLanguageLocale ?? 'en',
            deliveryMethod: 'NO_LOCATION'
        };
        if (selectedLang) {
            obj.catalogLanguageLocale = selectedLang;
        }
        // prepare meta data
        const comment = this.getOrderMetaData(orderMetadata, 'comment');
        if (comment || comment === '') {
            obj.comment = comment;
        }
        if (this.getOrderMetaData(orderMetadata, 'customerName')) {
            obj.customerName = this.getOrderMetaData(orderMetadata, 'customerName');
        }
        if (this.getOrderMetaData(orderMetadata, 'wishTime')) {
            obj.wishTime = this.getOrderMetaData(orderMetadata, 'wishTime');
        }
        if (this.getPickupMethodAsInt(orderMetadata) >= 0) {
            if (this.getOrderMetaData(orderMetadata, 'customerUserId') !== undefined) {
                obj.customerUserId = this.getOrderMetaData(orderMetadata, 'customerUserId');
            }
            if (this.getOrderMetaData(orderMetadata, 'customerEmail')) {
                obj.customerEmail = this.getOrderMetaData(orderMetadata, 'customerEmail');
            }
            const customerPhoneNumber = this.getOrderMetaData(orderMetadata, 'customerPhoneNumber');
            if (customerPhoneNumber && customerPhoneNumber.trim().length > 4) {
                obj.customerPhoneNumber = customerPhoneNumber;
            }
        }
        if (this.getOrderMetaData(orderMetadata, 'customerFloor')) {
            obj.floorNumber = this.getOrderMetaData(orderMetadata, 'customerFloor');
        }

        if (this.getPickupMethodAsInt(orderMetadata) === 0) {
            obj.deliveryMethod = 'IN_STORE_LOCATION';
            if (validLocations) {
                obj.location = validLocations.id;
                // clear current meta data and update it with location info
                // don't clear the order meta yet, do this after the order is submitted
            } else {
                // disable location validation as discussed via Slack...
                // somehow the location was manipulated after it was validated
                // return { errorMessage: 'public.global.errorExpected', errorCode: '300' };
            }
        }
        if (this.getOrderMetaData(orderMetadata, 'customerStreet')) {
            obj.deliveryStreetAddress = this.getOrderMetaData(orderMetadata, 'customerStreet');
        }
        if (this.getOrderMetaData(orderMetadata, 'customerZip')) {
            obj.deliveryPostCode = this.getOrderMetaData(orderMetadata, 'customerZip');
        }
        if (this.getOrderMetaData(orderMetadata, 'customerTown')) {
            obj.deliveryCity = this.getOrderMetaData(orderMetadata, 'customerTown');
        }
        if (this.getPickupMethodAsInt(orderMetadata) === 2) {
            obj.deliveryMethod = 'ADDRESS';
        }
        if (this.getOrderMetaData(orderMetadata, 'voucherCode')) {
            obj.voucherCode = this.getOrderMetaData(orderMetadata, 'voucherCode');
        }

        if (this.getOrderMetaData(orderMetadata, 'latitude')) {
            obj.latitude = this.getOrderMetaData(orderMetadata, 'latitude');
        }

        if (this.getOrderMetaData(orderMetadata, 'longitude')) {
            obj.longitude = this.getOrderMetaData(orderMetadata, 'longitude');
        }

        if (this.getOrderMetaData(orderMetadata, 'deliveryComment')) {
            obj.deliveryComment = this.getOrderMetaData(orderMetadata, 'deliveryComment');
        }
        return obj;
    }

    static mapToOrderUpdateRequest(order: Order, data: PresetOrderData): OrderUpdateRequest{
        const orderUpdateRequest: OrderUpdateRequest = {
            deliveryMethod:         order.deliveryMethod,
            uiLanguageLocale:       order.uiLanguageLocale,
            catalogLanguageLocale:  order.catalogLanguageLocale,
            comment:                data.comment ?? order.comment,
            latitude:               data.latitude ?? order.latitude,
            longitude:              data.longitude ?? order.longitude,
            externalOrderId:        data.externalOrderId ?? order.externalOrderId,
            customerEmail:          data.customerEmail ?? order.customerEmail,
            customerName:           data.customerName ?? order.customerName,
            customerPhoneNumber:    data.customerPhoneNumber ?? order.customerPhoneNumber,
            floorNumber:            data.floorNumber ?? order.floorNumber
        };
        if (order.deliveryMethod === 'ADDRESS') {
            orderUpdateRequest.deliveryCity = data.deliveryCity ?? order.deliveryCity;
            orderUpdateRequest.deliveryComment = data.deliveryComment ?? order.deliveryComment;
            orderUpdateRequest.deliveryPostCode = data.deliveryPostCode ?? order.deliveryPostCode;
            orderUpdateRequest.deliveryStreetAddress = data.deliveryStreetAddress ?? order.deliveryStreetAddress;
        }
        return orderUpdateRequest;
    }

    private static getOrderMetaData(orderMetadata: OrderMeta, key: string) {
        if (orderMetadata[key]) {
            return orderMetadata[key];
        }
        return '';
    }

    private static getPickupMethodAsInt(orderMetadata: OrderMeta) {
        return parseInt(orderMetadata.deliveryMethod, 10);
    }
}
