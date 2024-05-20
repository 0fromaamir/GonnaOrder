import { Inject, Injectable } from '@angular/core';
import { HelperService } from "../public/helper.service";
import { DOCUMENT } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class ViewportService {

  constructor(@Inject(DOCUMENT) private document: Document, private helperService: HelperService) {
  }

  applyCustomViewportForIOS() {
    if (this.helperService.isIOS()) {
      this.removeViewportMetaTag();
      this.createViewportMetaTag('width=device-width, initial-scale=1.0, user-scalable=0');
    }
  }

  private createViewportMetaTag(content: string): void {
    const meta = this.document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', content);
    this.document.head.appendChild(meta);
  }

  private removeViewportMetaTag(): void {
    const existingMetaTag = this.document.head.querySelector('meta[name=viewport]');
    if (existingMetaTag) {
      this.document.head.removeChild(existingMetaTag);
    }
  }
}
