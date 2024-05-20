import { Injectable } from '@angular/core';
import { Order, OrderItem } from '../stores/stores';
declare const fbq: any;

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  fbLoaded = false;

  initFacebook(fbCode: string) {
    if (!this.fbLoaded) {
      fbq('init', fbCode);
      fbq('track', 'PageView');
      this.fbLoaded = true;
      console.log('Facebook pixel initiated');
    }
  }

  registerPurchase(order: Order) {
    if (this.fbLoaded) {
      fbq(
        'track',
        'Purchase',
        {
          currency: order.currencyIsoCode,
          value: order.totalDiscountedPrice,
          delivery_category: order.deliveryMethod,
          contents: order.orderItems?.map((item) => this.itemContent(item)),
        },
        {
          eventID: `purchase-${order.uuid}`,
        }
      );
    }
  }

  registerAddToCart(order: Order, orderItem: OrderItem){
    if (this.fbLoaded) {
        fbq(
          'track',
          'AddToCart',
          {
            content_ids: [orderItem.offerId],
            content_name: orderItem.itemName,
            content_type: 'product',
            currency: order.currencyIsoCode,
            value: orderItem.discountedOfferPrice,
            contents: [ this.itemContent(orderItem)]
          }
        );
      }
  }

  registerInitiateCheckout(order: Order) {
    if (this.fbLoaded) {
      fbq(
        'track',
        'InitiateCheckout',
        {
          content_category: 'product',
          content_ids: order.orderItems?.map((item) => item.offerId),
          currency: order.currencyIsoCode,
          value: order.totalDiscountedPrice,
          num_items: order.orderItems?.reduce((acc, val) => acc + val.quantity, 0),
          contents: order.orderItems?.map((item) => this.itemContent(item)),
        }
      );
    }
  }

  private itemContent(orderItem: OrderItem){
    return  ({
        id: orderItem.offerId,
        quantity: orderItem.quantity,
        name: orderItem.name,
        itemName: orderItem.itemName,
        price: orderItem.price,
        offerPrice: orderItem.offerPrice,
        discountedOfferPrice: orderItem.discountedOfferPrice,
        totalNonDiscountedPrice: orderItem.totalNonDiscountedPrice,
        totalDiscountedPrice: orderItem.totalDiscountedPrice
      });
  }
}
