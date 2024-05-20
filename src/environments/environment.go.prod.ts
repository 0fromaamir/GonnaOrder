import { APPMODE } from "./appmode.enum";
import { whitelabel } from "./whitelabel";

export const environment = {
  production: true,
  adminHostURL: 'https://admin.gonnaorder.com',
  helpHostURL: 'https://gonnaorder.com/help/',
  stagingHost: 'testgodev',
  VAPID_PUBLIC_KEY: 'BH-cXEE6u4oWK61uILsQVZx_8DmGIXVXJzorS0bgADLqr5kzw9A6QV6DiHaazrUYxOUWH-BnByRroMYOvxnXpzY',
  myNextEndpointUrl: 'https://nextadmin.azurewebsites.net/api/',
  name: 'production',
  googleClientId: '468987336900-40rltpd7er3dfphee3tefds634puc7io.apps.googleusercontent.com',
  facebookClientId: '452370752423456',
  envDomain: 'gonnaorder.com',
  defaultDeeplinkAppId: "com.gonnaorder.go",
  defaultDeeplinkAppAndroidUrl: "https://play.google.com/store/apps/details?id=com.gonnaorder.go",
  defaultDeeplinkAppIOSUrl: "https://apps.apple.com/nl/app/gonnaorder/id1559531283?l=en",
  googleMapAPIKey: 'AIzaSyDi0CKnhnRClfWA5UC4MKNh55c6D9phWC8',
  hubriseLoginUrl: 'https://manager.hubrise.com/oauth2/v1/authorize?redirect_uri={{gonnaorder_uri}}/hubrise-user-login&client_id={{client_id}}&scope=location[orders.write,customer_list.write,catalog.write]&country={{country}}&account_name={{account_name}}',
  hubriseClientId: '992263448192.clients.hubrise.com',
  appleClientId: 'com.gonnaorder.goadmindev.backend',
  eposNowInstallLink: window['env'].eposNowInstallLink,
  backend : {
    baseURL: 'https://admin.gonnaorder.com',
    domain: 'gonnaorder.com',
  },
  mode: APPMODE.Customer,
  templateStoreAlias: '',
  appId: 'com.gonnaorder.go',
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
