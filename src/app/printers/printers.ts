import { Paging } from "src/app/api/types/Pageable";

export interface AutoprintSubscriptions {
  [storeId: string]: any;
}

export interface AutoprintQueueElement {
  storeId: number;
  orderId: string;
  printer: PrinterInfo;
  status: string;
}

export interface AutoprintState {
  subscriptions: AutoprintSubscriptions;
  autoprintQueue: AutoprintQueueElement[];
}

export interface PrinterInfo {
  name: string;
  url: string;
  type: 'AIRPRINT' | 'STAR' | 'ESC/POS';
  mode?: 'Bluetooth' | 'WiFi/Ethernet';
  ip?: string;
  port?: number;
  macAddr?: string;
  paperWidth?: number;
  enabled: boolean;
}

export interface PrintersList {
  data: PrinterInfo[];
  paging: Paging;
  totalPages: number;
}

export interface Printers {
  list: PrintersList;
  autoprintState: AutoprintState;
}

export enum PrintMode {
  PDFPRINT,
  IMAGEPRINT,
}