import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

declare var google: any;

@Directive({
  selector: '[appCustomGoogle]',
})
export class CustomGoogleDirective implements OnInit {
  type: 'icon' | 'standard' = 'standard';

  @Input()
  size: 'small' | 'medium' | 'large' = 'medium';

  @Input()
  text: 'signin_with' | 'signup_with' | 'continue_with' = 'signin_with';

  @Input()
  shape: 'square' | 'circle' | 'pill' | 'rectangular' = 'rectangular';

  @Input()
  theme: 'outline' | 'filled_blue' | 'filled_black' = 'outline';

  @Input()
  logo_alignment: 'left' | 'center' = 'left';

  width: number = 310;

  @Input()
  locale: string = '';

  @Input() events: Observable<any>;

  @Output() afterButtonRender = new EventEmitter<boolean>();

  constructor(private el: ElementRef, private socialAuthService: SocialAuthService) {}

  ngOnInit(): void {
    this.socialAuthService.initState.pipe(take(1)).subscribe(() => {
      this.events.subscribe((event: any) => {
        const [width, iconMode] = event;
        this.width = iconMode ? null : width;
        this.type = iconMode ? 'icon' : 'standard';
        this.shape = iconMode ? 'circle' : 'rectangular';
        this.renderButton();
      });
    });
  }

  renderButton() {
    this.afterButtonRender.emit(true);
    google.accounts.id.renderButton(this.el.nativeElement, {
      type: this.type,
      size: this.size,
      text: this.text,
      width: this.width,
      shape: this.shape,
      theme: this.theme,
      logo_alignment: this.logo_alignment,
      locale: this.locale,
    });
  }
}
