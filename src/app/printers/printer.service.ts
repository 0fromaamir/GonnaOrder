
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, from, Subject } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { getAutoprintQueue, getAutoprintSubscriptions, getAutoprintSubscriptionsByStoreId } from'./+state/printers.selectors';
import { AutoprintQueueElement, AutoprintSubscriptions, PrinterInfo } from './printers';
import { UpdateAutoprintQueue, UpdateAutoprintSubscriptions } from './+state/printers.actions';
import { OrderPdfResponse } from '../stores/store-order/store-order';
import { HttpClient, HttpResponse } from '@angular/common/http';
import EscPosEncoder from 'esc-pos-encoder-ionic';
import { STARPRINTER_EMULATION } from './star';
import { ToastrService } from 'ngx-toastr';
import { GoToast } from 'src/app/shared/go-toast.component';
import { LogService } from '../shared/logging/LogService';
import { HelperService } from '../public/helper.service';
import { BluetoothSerialService } from './bluetoothSerial.service';
import { Printer } from '@ionic-native/printer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';

declare var Socket: any;

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  subscriptions: AutoprintSubscriptions;
  autoPrintQueue$: Observable<AutoprintQueueElement[]>;
  bluetoothSerial: any;
  printTaskCompleted = true;
  private autoprintQueueDestroy$ = new Subject();
  airPrinter: Printer;
  file: File;

  constructor(private store: Store<any>,
    private platform: Platform,
    private http: HttpClient,
    private toastr: ToastrService,
    private logger: LogService,
    private helperService: HelperService,
    private bluetoothSerialService: BluetoothSerialService
  ) {
      this.airPrinter = new Printer();
      this.file = new File();

      this.subscriptions = {};
      this.autoPrintQueue$ = this.store.select(getAutoprintQueue);
      setInterval(r => {
      this.store.select(getAutoprintQueue).pipe(
        takeUntil(this.autoprintQueueDestroy$))
        .subscribe(async autoprintQueue => {
          if (!!autoprintQueue && autoprintQueue.length > 0 && autoprintQueue[0].status !== 'INPROGRESS' && this.printTaskCompleted) {
            const autoprintElem = autoprintQueue[0];
            autoprintQueue[0].status = 'INPROGRESS';
            this.store.dispatch(new UpdateAutoprintQueue(autoprintQueue));
            this.printTaskCompleted = false;
            this.autoPrint(autoprintElem.printer, autoprintElem.storeId, autoprintElem.orderId).toPromise()
              .then(res => {
                const autoprintQueueUpdated = autoprintQueue.filter(autoprint => autoprint.orderId !== autoprintElem.orderId);
                this.store.dispatch(new UpdateAutoprintQueue(autoprintQueueUpdated));
                this.printTaskCompleted = true;
                return of(res);
            }).catch(err => {
              const autoprintQueueUpdated = autoprintQueue.filter(autoprint => autoprint.orderId !== autoprintElem.orderId);
              this.store.dispatch(new UpdateAutoprintQueue(autoprintQueueUpdated));
              this.printTaskCompleted = true;
            });
          }
        });
      }, 5000);

      this.platform.ready().then(() => {
        this.bluetoothSerial = this.bluetoothSerialService.loadBluetoothSerial().then(
          bluetoothSerial => this.bluetoothSerial = bluetoothSerial
        );
      });
      
  }

  isSupported() {
    // need some investigation...
    return true;
  }

  init(subscriptions: any) {
    this.subscriptions = { ...subscriptions };
  }

  addSubscription(storeId: number, subscriptions: any) {
    this.init(subscriptions);
    if (!Object.prototype.hasOwnProperty.call(this.subscriptions, storeId)) {
      this.subscriptions[`${storeId}`] = true;
      this.store.dispatch(new UpdateAutoprintSubscriptions(this.subscriptions));
    } else {
      this.logger.debug('autoprint duplicate subscription, subscription cancelled...', this.subscriptions);
    }
    return this.subscriptions;
  }

  removeSubscription(storeId: number, subscriptions: any) {
    this.subscriptions = { ...subscriptions };
    if (Object.prototype.hasOwnProperty.call(this.subscriptions, storeId)) {
      delete this.subscriptions[`${storeId}`];
      this.logger.debug('autoprint subscription removed', this.subscriptions);
      this.clearAutoPrintQueue(storeId);
      this.store.dispatch(new UpdateAutoprintSubscriptions(this.subscriptions));
    } else {
      this.logger.debug(`autoprint subscription with ${storeId} does not exist`, this.subscriptions);
    }
    return this.subscriptions;
  }

  requestPermission(): Observable<boolean> {
    if (this.isAndroid()) {
      return of(true);
    } else if (this.isIOS()) {
      return from(this.airPrinter.isAvailable());
    } else {
      return of(false);
    }
  }
  
  printContentUrlToAirPrintPrinter(contentUrl: string, printerUrl: string) {
    this.logger.debug("before printContentUrlToAirPrintPrinter: ", contentUrl, printerUrl);
    return from(this.airPrinter.print(contentUrl, { printer: printerUrl }));
  }

  isAndroid() {
    return this.helperService.isAndroid();
  }

  isIOS() {
    return this.helperService.isIOS();
  }

  printContentUrl(contentUrl: string, printer: PrinterInfo) {
    const printerUrl = printer.url;
    const type = printer.type;

    if (type == "AIRPRINT") {
      return this.printContentUrlToAirPrintPrinter(contentUrl, printerUrl);
    }
    
    return of(null);
  }

  saveFile(blob: Blob, fileName: string) {
    var storageLocation = '';
		if (this.platform.is('android')) {
      storageLocation = this.file.externalRootDirectory + 'Download/';
		} else if (this.platform.is('ios')) {
      storageLocation = this.file.documentsDirectory;
		} else {
      this.logger.debug('Not supported device: ', this.platform);
      return;
    }
    var filePath = storageLocation;
    return from(this.file.writeFile(filePath, fileName, blob, { replace: true, append: false }));
  }

  addToAutoPrintQueue(printer: PrinterInfo, storeId: number, orderId: string): Observable<boolean> {
    this.autoPrintQueue$.pipe(take(1))
      .subscribe(autoprintQueue => {
        if (!autoprintQueue) { autoprintQueue = []; }
        autoprintQueue.push({ storeId: storeId, orderId: orderId, printer: printer, status: 'NOTSTARTED' });
        this.store.dispatch(new UpdateAutoprintQueue(autoprintQueue));
      });
      return of(true);
  }

  clearAutoPrintQueue(storeId: number) {
    this.autoPrintQueue$.pipe(take(1))
      .subscribe(autoprintQueue => {
        const updatedAutoprintQueue = autoprintQueue.filter(elem => elem.storeId !== storeId);
        this.store.dispatch(new UpdateAutoprintQueue(updatedAutoprintQueue));
      });
      return of(true);
  }

  autoPrint(printer: PrinterInfo, storeId: number, orderId: string): Observable<OrderPdfResponse> {
    
    return this.http.get(`/api/v1/stores/${storeId}/orders/${orderId}/invoice?toImage=true`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      take(1),
      switchMap(async r => {

        this.logger.debug("AutoPrint: Started");
        let blobResObj = this.toOrderCodeResponse((r as HttpResponse<Blob>));
        const socket = new Socket();
        const encoder = new EscPosEncoder();
        const result = encoder.initialize();
        let resultByte = null;

        let img = new Image();
        img.src = URL.createObjectURL(blobResObj.blob);

        const self = this;

        const loader = new Promise(resolve => {

          this.logger.debug("AutoPrint: Loading Image");
          
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const aspectRatio = img.height / img.width;
            canvas.width = printer.paperWidth * 3.78 * 2;
            canvas.height = aspectRatio * canvas.width;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const data = ctx.canvas.toDataURL();
            resultByte = encoder
                .newline().newline().newline()
                .image(canvas, 8 * (Math.floor(canvas.width / 8)), 8 * (Math.floor(canvas.height / 8)), 'atkinson', 1)
                .newline().newline().newline()
                .newline().newline().newline()
                .cut()
                .encode();
                        
            switch (printer.mode) {
              case 'WiFi/Ethernet':
                socket.open(
                  printer.ip,
                  printer.port,
                  () => {
                    socket.write(resultByte, () => {
                      socket.shutdownWrite();
                      self.toastr.success(null, `Printed Successfully for Order Uuid - ` + orderId, {
                        toastComponent: GoToast,
                      });
                      resolve(self.printTaskCompleted = true);
                    });
                  },
                  (err) => {
                    self.toastr.error(null, `AutoPrint WiFi Error : ` + JSON.stringify(err), {
                      toastComponent: GoToast,
                    });
                    resolve(self.printTaskCompleted = true);
                  }
                );
                break;
              case 'Bluetooth':
                of(self.bluetoothSerial.connect(printer.macAddr, resultByte)).pipe(take(1)).subscribe(() => {
                  self.toastr.success(null, `Printed Successfully for Order Uuid - ` + orderId, {
                    toastComponent: GoToast,
                  });
                  resolve(self.printTaskCompleted = true);
                }, err => {
                  self.toastr.error(null, `AutoPrint Bluetooth Error : ` + JSON.stringify(err), {
                    toastComponent: GoToast,
                  });
                  resolve(self.printTaskCompleted = true);
                });
                break;
            }
          }
        });
        await loader.then(res => {
          this.logger.debug(JSON.stringify(res));
        }).catch(err => {
          this.logger.error(err)
          this.printTaskCompleted = true;
        });
        return blobResObj;
      })
    );
  }

  testPrint(printerMode, printerName, connectionParamsIp, connectionParamsPort, connectionParamsBluetooth, connectionParamsPaperWidthInMM): Promise<boolean> {

    return new Promise(resolve => {
      const socket = new Socket();
      const self = this;
      let img = new Image();
      img.src = 'assets/printer-test-image.png';
      const encoder = new EscPosEncoder();

      const testSuccessfulText = (printerMode === 'Bluetooth') ? 
                                    'Bluetooth MAC : ' + connectionParamsBluetooth :
                                    'IP : ' + connectionParamsIp + '  Port : ' + connectionParamsPort;
      const resultByte = encoder
        .align('center')
        .line('Congratulation, ' + printerName + ' print success')
        .line(testSuccessfulText)
        .newline().newline().newline()
        .newline().newline().newline()
        .cut().encode();
      
      const testImageLoader = new Promise(resolveImageLoad => {
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const aspectRatio = img.height / img.width;
          canvas.width = connectionParamsPaperWidthInMM * 3.78 * 2;
          canvas.height = aspectRatio * canvas.width;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          resolveImageLoad(encoder
              .newline().newline().newline()
              .image(canvas, 8 * (Math.floor(canvas.width / 8)), 8 * (Math.floor(canvas.height / 8)), 'atkinson', 1)
              .newline().newline().newline()
              .newline().newline().newline()
              .cut().encode());
        }
      });

      testImageLoader.then(resultByteImage => {
        if (!resultByteImage) {
          this.log('Unable to Load Test Image!');
          resolve(false);
        }
        this.log('Trying to Print...');

        if (printerMode === 'Bluetooth') {
          const btPrint = new Promise(resolveBtPrint => {
            of(this.bluetoothSerial.connect(connectionParamsBluetooth, resultByte)).pipe(take(1)).subscribe(() => {
              this.log('Printer Test - Text Print Successful!');
              resolveBtPrint('success');
            },
            (err) => {
              this.log('Printer Connection Error : ' + JSON.stringify(err));
              resolve(false);
            });
          });
          btPrint.then(res => {
            of(this.bluetoothSerial.connect(connectionParamsBluetooth, resultByteImage)).pipe(take(1)).subscribe(() => {
              this.log('Printer Test - Image Print Successful!');
              resolve(true);
            },
            (err) => {
              this.log('Printer Connection Error : ' + JSON.stringify(err));
              resolve(false);
            });
          });
        }
        else {
          socket.onError = (err) => {
            this.log(JSON.stringify(err));
            socket.close();
          }
          socket.open(
            connectionParamsIp,
            connectionParamsPort,
            () => {
              socket.write(resultByte,
              () => {
                this.log('Printer Test - Text Print Successful!');
              },
              (err) => {
                this.log('Printer Test - Text Print Failed!' + JSON.stringify(err));
                resolve(false);
              });
              setTimeout(() => {
                socket.write(resultByteImage,
                () => {
                  socket.shutdownWrite();
                  this.log('Printer Test - Image Print Successful!');
                  resolve(true);
                },
                (err) => {
                  this.log('Printer Test - Image Print Failed!' + JSON.stringify(err));
                  resolve(false);
                });
              }, 500);
            },
            (err) => {
              this.log('Printer Test Failed! : ' + JSON.stringify(err));
              socket.close();
              resolve(false);
            }
          );
        }
      }).catch(err => {
        this.log('Printer Test Failed While Loading Test Image : ' + JSON.stringify(err));
        resolve(false);
      });
    });
  }

  private toOrderCodeResponse(response: HttpResponse<Blob>): OrderPdfResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
    return { blob, filename };
  }

  private log(msg) {
    this.logger.debug(msg);
    this.toastr.error(null, msg, { toastComponent: GoToast, });
  }

}