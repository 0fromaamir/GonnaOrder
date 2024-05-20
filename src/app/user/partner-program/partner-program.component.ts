import { Component, OnInit } from '@angular/core';
import {Router, NavigationEnd, Scroll} from '@angular/router';
import { helpPage } from 'src/app/shared/help-page.const';

@Component({
  selector: 'app-partner-program',
  templateUrl: './partner-program.component.html',
  styleUrls: ['./partner-program.component.scss']
})
export class PartnerProgramComponent implements OnInit {

  defaultUrl = '/manager/user/partner';
  isActive = false;
  partnerProgramHelpPage = helpPage.partner;

  constructor(private router: Router) { }
  ngOnInit() {
    this.isActive = (this.defaultUrl === this.router.url);
    this.router.events.subscribe(val => {
      /*
        Router outlet ends navigation router events before component loaded it is breaking change in Angular 15( https://angular.io/guide/update-to-version-15#routeroutlet-instantiates-the-component-after-change-detection).
        scroll event emits after component is loaded hence we can also check that event which is triggered from app component window.scrollTo(0, 0);
        https://github.com/angular/angular/issues/49996
      */
      if (val instanceof NavigationEnd || val instanceof Scroll) {
        const navigationEndEvent: NavigationEnd  = val instanceof NavigationEnd ? val : val.routerEvent;
        this.isActive = (navigationEndEvent.url === this.defaultUrl);
      }
    });
  }
}
