import { APPMODE } from "./appmode.enum";
import { whitelabel } from "./whitelabel";

export const environment = {
  production: true,
  adminHostURL: window['env'].adminHostURL,
  helpHostURL: 'https://gonnaorder.com/help/',
  stagingHost: 'testgodev',
  VAPID_PUBLIC_KEY: 'BH-cXEE6u4oWK61uILsQVZx_8DmGIXVXJzorS0bgADLqr5kzw9A6QV6DiHaazrUYxOUWH-BnByRroMYOvxnXpzY',
  myNextEndpointUrl: 'https://nextadmin.azurewebsites.net/api/',
  name: window['env'].name,
  googleClientId: window['env'].googleClientId,
  facebookClientId: window['env'].facebookClientId,
  envDomain: window['env'].envDomain,
  defaultDeeplinkAppId: 'com.gonnaorder.godev',
  defaultDeeplinkAppAndroidUrl: 'https://play.google.com/apps/internaltest/4700458140181790900',
  defaultDeeplinkAppIOSUrl: 'https://testflight.apple.com/join/BENrPjVw',
  googleMapAPIKey: 'AIzaSyDi0CKnhnRClfWA5UC4MKNh55c6D9phWC8',
  hubriseLoginUrl: 'https://manager.hubrise.com/oauth2/v1/authorize?redirect_uri={{gonnaorder_uri}}/hubrise-user-login&client_id={{client_id}}&scope=location[orders.write,customer_list.write,catalog.write]&country={{country}}&account_name={{account_name}}',
  hubriseClientId: window['env'].hubriseClientId,
  appleClientId: window['env'].appleClientId,
  eposNowInstallLink: window['env'].eposNowInstallLink,
  backend: {
    baseURL: 'https://admin.gonnaorder.com',
    domain: "gonnaorder.com",
  },
  mode: APPMODE.Web,
  templateStoreAlias: '',
  appId: '',
  firebaseConfig: {
    apiKey: "AIzaSyD9SfnOCskFaUzk2u2zXuGyLAbjy0EVHoQ",
    authDomain: "goadmin-d621f.firebaseapp.com",
    projectId: "goadmin-d621f",
    storageBucket: "goadmin-d621f.appspot.com",
    messagingSenderId: "982274508593",
    appId: "1:982274508593:web:281374a78063f446c39210",
    measurementId: "G-S2BRD6HWWN"
  },
  webSocketTopic: "/topic/events.orders.",
  webSocketEndPoint: 'wss://admin.testgodev.nl/go',
  fcmTopicPrefix: 'develop-fcm-topic-order-',
  whitelabel: whitelabel
};
