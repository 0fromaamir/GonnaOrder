import {Directive, HostListener} from '@angular/core';
import {BreakpointObserver} from "@angular/cdk/layout";

@Directive({
  selector: '[appSideBarControl]'
})
export class SideBarControlDirective {

  constructor() {

  }


  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    const width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;
    if (width < 576) {
      if (document.querySelector('body').classList.contains('sidebar-show')) {
        this.removeSideBarMinimized();
      }
    }
    if (width >= 576 && width < 1200) {
      if (document.querySelector('body').classList.contains('sidebar-show')) {
        this.removeSideBarMinimized();
      } else {
        this.addSideBarMinimized();
      }
    }
    if (width >= 1200) {
      if (document.querySelector('body').classList.contains('sidebar-show')) {
        this.addSideBarMinimized();
      } else {
        this.removeSideBarMinimized();
      }
    }
  }


  removeSideBarMinimized() {
    document.querySelector('body').classList.remove('sidebar-minimized');
    document.querySelector('body').classList.remove('brand-minimized');
  }

  addSideBarMinimized() {
    document.querySelector('body').classList.add('sidebar-minimized');
    document.querySelector('body').classList.add('brand-minimized');
  }
}
