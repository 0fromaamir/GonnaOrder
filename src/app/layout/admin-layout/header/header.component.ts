import { Component, OnInit, Input, OnDestroy, HostBinding, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() fixed: boolean;

  @Input() navbarBrand: any;
  @Input() navbarBrandFull: any;
  @Input() navbarBrandMinimized: any;
  @Input() navbarBrandText: any = {icon: '🅲', text: '🅲 CoreUI'};
  @Input() navbarBrandRouterLink: any[] | string = '';

  @Input() sidebarToggler: string | boolean;
  @Input() mobileSidebarToggler: boolean;

  @Input() asideMenuToggler: string | boolean;
  @Input() mobileAsideMenuToggler: boolean;

  private readonly fixedClass = 'header-fixed';

  @HostBinding('class.app-header') appHeaderClass = true;
  @HostBinding('class.navbar') navbarClass = true;

  navbarBrandImg: boolean;

  private readonly breakpoints = ['xl', 'lg', 'md', 'sm', 'xs'];
  sidebarTogglerClass = 'd-none d-md-block';
  sidebarTogglerMobileClass = 'd-lg-none';
  asideTogglerClass = 'd-none d-md-block';
  asideTogglerMobileClass = 'd-lg-none';
  currentBreakpoint;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.isFixed(this.fixed);
    this.navbarBrandImg = Boolean(this.navbarBrand || this.navbarBrandFull || this.navbarBrandMinimized);
    this.navbarBrandRouterLink = this.navbarBrandRouterLink[0] ? this.navbarBrandRouterLink : '';
    this.sidebarTogglerClass = this.setToggerBreakpointClass(this.sidebarToggler as string);
    this.sidebarTogglerMobileClass = this.setToggerMobileBreakpointClass(this.sidebarToggler as string);
    this.asideTogglerClass = this.setToggerBreakpointClass(this.asideMenuToggler as string);
    this.asideTogglerMobileClass = this.setToggerMobileBreakpointClass(this.asideMenuToggler as string);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, this.fixedClass);
  }

  isFixed(fixed: boolean = this.fixed): void {
    if (fixed) {
      this.renderer.addClass(this.document.body, this.fixedClass);
    }
  }

  setToggerBreakpointClass(breakpoint = 'sm') {
    let togglerClass = 'd-none d-sm-block';
    if (this.breakpoints.includes(breakpoint)) {
      togglerClass = `d-none d-${breakpoint}-block`;
    }
    return togglerClass;
  }

  setToggerMobileBreakpointClass(breakpoint = 'sm') {
    let togglerClass = 'd-sm-none';
    if (this.breakpoints.includes(breakpoint)) {
      togglerClass = `d-${breakpoint}-none`;
    }
    return togglerClass;
  }

  handleClick($event: MouseEvent) {
    console.log($event)
  }
}
