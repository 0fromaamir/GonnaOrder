import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appPreventEnter]'
})
export class PreventEnterDirective {

  constructor(private el: ElementRef) { }

  @HostListener('keydown.enter', ['$event'])
  preventEnterKey(event: KeyboardEvent): void {
    event.preventDefault();
  }
}
