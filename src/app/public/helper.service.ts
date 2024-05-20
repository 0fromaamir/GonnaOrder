import { DOCUMENT } from '@angular/common';
import { ElementRef, Inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { LocalStorageService } from 'src/app/local-storage.service';
import { environment } from 'src/environments/environment';
import { APPMODE } from 'src/environments/appmode.enum';
import { WINDOW } from './window-providers';
import { ORIGIN_TYPE } from './store/store-checkout/checkout.service';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(
    // should be standalone dependencies to avoid circular dependencies issue
    private storageService: LocalStorageService,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: any
  ) {}

  deviceIdentifierCheck = { flag: false, orderId: '' };

  formatText(content: string): string {
    const regex = new RegExp(
      // protocol part(optional)
      '(([\\w]+:)?//)?' +
        // email address local part(optional)
        '(' +
        '([\\d\\w]|%[a-f\\d]{2,2})+' +
        '(:([\\d\\w]|%[a-f\\d]{2,2})+)?' +
        '@' +
        ')?' +
        // domain part
        '([\\d\\w][-\\d\\w]{0,253}[\\d\\w]\\.)+' +
        '[\\w]{2,63}' +
        // port number part(optional)
        '(:[\\d]+)?' +
        // path part(optional)
        '(/([-+_~.\\d\\w]|%[a-f\\d]{2,2})*)*' +
        // hash and query param part(optional)
        '(' +
        // allow query param after hash(optional) (extral requirement)
        '(#(/?[-+_~.\\d\\w]|%[a-f\\d]{2,2})*)(\\?(&?([-+_~.\\d\\w]|%[a-f\\d]{2,2})[=]?)*)' +
        '|' +
        // query param part(optional)
        '(\\?(&?([-+_~.\\d\\w]|%[a-f\\d]{2,2})[=]?)*)?' +
        // hash part(optional)
        '(#(/?[-+_~.\\d\\w]|%[a-f\\d]{2,2})*)?' +
        ')',
      'ig'
    );
    let result = content.replace(regex, (url) => {
      return '<a href="' + url + '">' + url + '</a>';
    });
    const boldStrings = result.split('**');
    result = boldStrings
      .map((str, index) => {
        if (index % 2 && index !== boldStrings.length - 1) {
          return '<b>' + str + '</b>';
        }
        return str;
      })
      .join('');
    const italicStrings = result.split('__');
    result = italicStrings
      .map((str, index) => {
        if (index % 2 && index !== boldStrings.length - 1) {
          return '<i>' + str + '</i>';
        }
        return str;
      })
      .join('');
    return result;
  }

  getExcerpt(content: string, numOfChars: number) {
    if (!content || content.length === 0) {
      return {
        excerpt: '',
        reminder: '',
      };
    }
    if (content.length < numOfChars) {
      return {
        excerpt: this.formatText(content.replace(/(\r\n|\n|\r)/gm, '<br>')),
        reminder: '',
      };
    }
    let excerptCont = content.substr(0, numOfChars);

    // re-trim if we are in the middle of a word
    excerptCont = excerptCont.substr(
      0,
      Math.min(excerptCont.length, excerptCont.lastIndexOf(' ') ? excerptCont.lastIndexOf(' ') : excerptCont.length)
    );
    return {
      excerpt: this.formatText(excerptCont.replace(/(\r\n|\n|\r)/gm, '<br>')),
      reminder: this.formatText(content.substring(excerptCont.length).replace(/(\r\n|\n|\r)/gm, '<br>')),
    };
  }

  checkLocationInputValidity(value, min = 0, max = 0) {
    if (min !== 0 && max !== 0) {
      const regex = new RegExp('^([a-z0-9-_ ]){' + min + ',' + max + '}$', 'i');
      return regex.test(value);
    }
    return /^([a-z0-9-_ ]){1,10}$/i.test(value);
  }

  // not in use anymore
  // it will trunn a string into acceptable slug
  slugify(val: string) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    return val
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  /**
   * check if the value passed is valid language two or three letter iso
   * @param val string, language two or three letter iso
   */
  checkValidLangIso(val: string) {
    const regex = new RegExp('^[a-z]{2,3}$');
    return regex.test(val);
  }

  scrollCalc(el: ElementRef = null) {
    if (el != null) {
      if (
        el.nativeElement.offsetHeight + el.nativeElement.scrollTop >= el.nativeElement.scrollHeight ||
        (!el.nativeElement.scrollTop && el.nativeElement.offsetHeight === el.nativeElement.scrollHeight)
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      const h = this.window.innerHeight || this.document.documentElement.clientHeight || this.document.body.clientHeight;
      if (this.window.scrollY + h >= this.document.body.scrollHeight) {
        return false;
      } else {
        return true;
      }
    }
  }
  scrollShowElement(el: ElementRef) {
    if (!el) {
      return false;
    }
    const elPos = el.nativeElement.offsetTop + el.nativeElement.offsetHeight;
    if (this.window.scrollY > elPos) {
      return true;
    } else {
      return false;
    }
  }
  scrollPage(el: ElementRef = null) {
    const subject: Subject<any> = new Subject<any>();
    this.doScrolling(el, 300, 50, false, 'down', subject);
  }

  scrollTo(offsetTop: number, scrollSpeed = 700, el: ElementRef = null) {
    const subject: Subject<any> = new Subject<any>();
    this.doScrolling(el, scrollSpeed, offsetTop, true, 'down', subject);
  }

  doScrolling(el, duration, scrollBy, fromTop, direction, subject: Subject<any>) {
    const w = this.window;
    let startingY = 0;
    let currentY = 0;
    if (el != null) {
      startingY = currentY = el.nativeElement.scrollTop;
    } else {
      startingY = currentY = w.scrollY;
    }
    if (fromTop) {
      scrollBy = scrollBy - startingY;
      if (scrollBy === currentY) {
        return;
      }
    }
    let start;

    w.requestAnimationFrame(function step(timestamp) {
      start = !start ? timestamp : start;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);
      if (el != null) {
        direction === 'down'
          ? (el.nativeElement.scrollTop = startingY + Math.floor(scrollBy * percent))
          : (el.nativeElement.scrollTop = startingY - Math.floor(scrollBy * percent));
      } else {
        direction === 'down'
          ? w.scroll(0, startingY + Math.floor(scrollBy * percent))
          : w.scroll(0, startingY - Math.floor(scrollBy * percent));
      }

      if (time < duration) {
        w.requestAnimationFrame(step);
        subject.next({});
      } else {
        subject.complete();
      }
    });
  }

  focusTextArea(element) {
    if (element.children[0].nodeName === 'TEXTAREA') {
      element.children[0].focus();
      if (this.isAndroid()) {
        setTimeout(() => {
          element.children[0].scrollIntoView();
        }, 300);
      }
    }
  }

  isAndroid() {
    const userAgent = navigator.userAgent || navigator.vendor;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return false;
    }
    if (/android/i.test(userAgent)) {
      return true;
    }
    return false;
  }

  isIOS() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('ipad') > -1 || ua.indexOf('iphone') > -1 || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  isMobileApp() {
    return environment.mode !== APPMODE.Web;
  }

  calcInnerHeight() {
    const lgWidth = 992;
    const headerHeightWithoutSidebar = 100;
    const headerHeightWithSidebar = 120;
    if (this.window.innerWidth < lgWidth) {
      return this.window.innerHeight - headerHeightWithoutSidebar;
    }
    return this.window.innerHeight - headerHeightWithSidebar;
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  generateDeviceID() {
    const pattern = [8, 4, 4, 4, 12];
    const chars = 'abcdef';
    return pattern
      .map((len) => {
        return Array(len)
          .fill(0)
          .map(() => {
            const i = this.getRandomInt(16);
            return i < 10 ? i.toString() : chars[i - 10];
          })
          .join('');
      })
      .join('-');
  }

  getDeviceID() {
    let deviceID = this.storageService.getSavedState('deviceID');
    if (!deviceID) {
      deviceID = this.generateDeviceID();
      this.storageService.setSavedState(deviceID, 'deviceID');
    }
    return deviceID;
  }
  getDomainUrl() {
    let domainUrl = window.location.host;
    if (!window.location.host.startsWith(environment.envDomain)) {
      // domainUrl = domainUrl.split('.').slice(1).join('.');
      domainUrl = environment.envDomain;
    }
    return domainUrl;
  }

  processOpenTimeSchedule(schedule, timezoneStore) {
    const availabitity = schedule.availabilities;
    const result = {
      MON: {
        title: 'public.global.days.mon',
        items: [],
      },
      TUE: {
        title: 'public.global.days.tue',
        items: [],
      },
      WED: {
        title: 'public.global.days.wed',
        items: [],
      },
      THU: {
        title: 'public.global.days.thu',
        items: [],
      },
      FRI: {
        title: 'public.global.days.fri',
        items: [],
      },
      SAT: {
        title: 'public.global.days.sat',
        items: [],
      },
      SUN: {
        title: 'public.global.days.sun',
        items: [],
      },
    };
    const storeTimezone = timezoneStore;
    const now = new Date();
    const storeTime = new Date(now.toLocaleString('en-US', { timeZone: storeTimezone }));
    let storeTimeDiff = 0;
    if (!isNaN(storeTime.getTime())) {
      storeTimeDiff = now.getTime() - storeTime.getTime();
    }

    availabitity.map((item) => {
      const startTime = new Date('2000-01-01T' + item.startTime + 'Z');
      startTime.setTime(startTime.getTime() + storeTimeDiff);
      const endTime = new Date('2000-01-01T' + item.endTime + 'Z');
      endTime.setTime(endTime.getTime() + storeTimeDiff);
      if (item.daysOfWeek) {
        for (const dayOfWeek of item.daysOfWeek) {
          result[dayOfWeek].items.push({
            startTime: startTime.toISOString().substr(11, 5),
            endTime: endTime.toISOString().substr(11, 5),
          });
        }
      } else if (!item.date) {
        for (const day of Object.keys(result)) {
          result[day].items.push({
            startTime: startTime.toISOString().substr(11, 5),
            endTime: endTime.toISOString().substr(11, 5),
          });
        }
      }
    });

    const resultArray = Object.values(result);

    for (let i = 0; i < resultArray.length; i++) {
      const nextI = (i + 1) % 7;

      resultArray[i].items.sort((a, b) => a.startTime.localeCompare(b.startTime));

      resultArray[i].items.forEach((item) => {
        // merge time slots for consecutive days
        if (['23:59', '00:00'].includes(item.endTime)) {
          const nextDayItem = resultArray[nextI].items.find(
            (nextItem) => ['00:00', '00:01'].includes(nextItem.startTime) && nextItem.endTime <= '06:00' && nextItem.endTime !== '00:00'
          );
          if (nextDayItem) {
            item.endTime = nextDayItem.endTime;
            resultArray[nextI].items.splice(resultArray[nextI].items.indexOf(nextDayItem), 1);
          }
        }

        // mark 24h time slots
        if (item.startTime === '00:00' && ['23:59', '00:00'].includes(item.endTime)) {
          item.time24h = true;
        }
      });
    }

    return resultArray;
  }

  calculateLogoTheme(event: any) {
    const LOGO_HEIGHT_MARGIN = 10;
    const LOGO_HEIGHT_RATIO = 0.75;
    const BACKGROUND_WIDTH_MARGIN = 200;
    const BORDER_SIZE = 10;
    const BRIGHTNESS_THRESHOLD = 128;
    const RED_WEIGHT = 0.2126;
    const GREEN_WEIGHT = 0.7152;
    const BLUE_WEIGHT = 0.0722;

    const { r, g, b } = this.analyseImage(event.target, BORDER_SIZE);
    const brightness = RED_WEIGHT * r + GREEN_WEIGHT * g + BLUE_WEIGHT * b;
    const isDark = brightness < BRIGHTNESS_THRESHOLD;

    const logoMargin = Math.round((event.target.height + LOGO_HEIGHT_MARGIN) * LOGO_HEIGHT_RATIO);
    const backgroundMargin = event.target.width + BACKGROUND_WIDTH_MARGIN;
    const logoBackgrondColor = `rgba(${r},${g},${b},1)`;

    return { logoMargin, backgroundMargin, logoBackgrondColor, isDark };
  }

  analyseImage(img: any, border: any) {
    const canvas = document.createElement('canvas'); // create a canvas element
    const ctx = canvas.getContext('2d'); // get context
    const w = img.naturalWidth; // get actual width..
    const h = img.naturalHeight;

    canvas.width = w; // set canvas size
    canvas.height = h;

    ctx.drawImage(img, 0, 0); // draw in image

    // do checks:, for example:
    // if (border*2 > canvas.width || border*2 > canvas.height) throw "Image too small!";

    // get borders, avoid overlaps (though it does not really matter in this case):
    const top = ctx.getImageData(0, 0, w, border).data;
    const left = ctx.getImageData(0, border, border, h - border * 2).data;
    const right = ctx.getImageData(w - border, border, border, h - border * 2).data;
    const bottom = ctx.getImageData(0, h - border, w, border).data;

    let r = 0;
    let g = 0;
    let b = 0;
    let cnt = 0;

    // count pixels and add up color components: (see function below)
    countBuffer(top);
    countBuffer(left);
    countBuffer(right);
    countBuffer(bottom);

    // calc average
    r = Math.round(r / cnt);
    g = Math.round(g / cnt);
    b = Math.round(b / cnt);

    return { r, g, b };

    function countBuffer(data) {
      let i = 0;
      const len = data.length;
      while (i < len) {
        r += data[i++]; // add red component etc.
        g += data[i++];
        b += data[i++];
        i++;
        cnt++; // count one pixel
      }
    }
  }

  isGoApp() {
    return environment.mode === APPMODE.Customer;
  }

  isGoTemplateApp() {
    return environment.mode === APPMODE.Template;
  }

  isGoAdminApp() {
    return environment.mode === APPMODE.Admin;
  }

  generateBasePath(baseUrl: string, storeId: number, originType: string, originDomain: string, storeAlias: string) :string {
    let appPath = baseUrl;

    if (appPath === '') {
      appPath = '/';
    }
    
    if (originType === ORIGIN_TYPE.APP) {
      appPath = '/public';

      if (originDomain === 'com.gonnaorder.go' || originDomain === 'com.gonnaorder.godev') {
        appPath = `/public/customer/store/${storeAlias}`;
      }

      if (originDomain === 'com.gonnaorder.goadmin' || originDomain === 'com.gonnaorder.goadmindev') {
        appPath = `/manager/stores/${storeId}/capture/${storeAlias}`;
      }
    }

    return appPath;
  }
}
