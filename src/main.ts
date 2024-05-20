
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Integrations } from '@sentry/tracing';
import * as Sentry from '@sentry/angular';
import { gtm } from './app/shared/google-tag-manager';


// Load Google Tag Manager only in prod environment
if (environment.production) {
  const ADMIN_GTM = "GTM-KL7TDSZ";
  const CUSTOMER_GTM = "GTM-KBX9VSW";
  
  const gtmKey = window.location.hostname === "admin.gonnaorder.com" ? ADMIN_GTM : CUSTOMER_GTM;
  gtm(gtmKey);
  console.log("Google Tag Manager initiated with key: " + gtmKey)
} 

const RMSScript = document.createElement('script');
RMSScript.type = 'text/javascript';
RMSScript.src = 'assets/rxp-js.js';
document.head.appendChild(RMSScript);

const vivaScript = document.createElement('script');
vivaScript.type = 'text/javascript';
vivaScript.src = 'https://demo.vivapayments.com/web/checkout/v2/js';
document.head.appendChild(vivaScript);

const treeviewScript = document.createElement('script');
treeviewScript.type = 'text/javascript';
treeviewScript.src = 'assets/tree-structure/treeview.js';
document.head.appendChild(treeviewScript);

if (environment.production) {
  enableProdMode();
}

if (environment.name !== 'local') {

  Sentry.init({
    dsn: 'https://5d3d0a9d077f48fc8660b419ebdd8cdd@o541440.ingest.sentry.io/5660361',
    environment: environment.name,
    integrations: [
      // Registers and configures the Tracing integration,
      // which automatically instruments your application to monitor its
      // performance, including custom Angular routing instrumentation
      new Integrations.BrowserTracing({
        tracingOrigins: ['localhost', 'https://admin.gonnaorder.com'],
        routingInstrumentation: Sentry.routingInstrumentation,

      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
