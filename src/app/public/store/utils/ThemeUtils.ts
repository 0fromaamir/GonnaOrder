export class ThemeUtils {
  private constructor() {}

  private static readonly noBackgroundHighlightedColorText: string = '--no-background-highlighted-color-text';
  private static readonly noBackgroundHighlightedColorDateText: string = '--no-background-highlighted-color-date-text';
  private static readonly noBackgroundHighlightedColorDateIcon: string = '--no-background-highlighted-color-date-icon';
  private static readonly noBackgroundHighlightedColorHeader: string = '--no-background-highlighted-color-header';
  private static readonly noBackgroundHighlightedColorSubtitle: string = '--no-background-highlighted-color-subtitle';
  private static readonly noBackgroundHighlightedColorSubtitle2: string = '--no-background-highlighted-color-subtitle-2';
  private static readonly noBackgroundHighlightedColorSubtitle3: string = '--no-background-highlighted-color-subtitle-3';
  private static readonly noBackgroundHighlightedColorSecondaryText: string = '--no-background-highlighted-color-secondary-text';
  private static readonly noBackgroundHighlightedColorBlackIcon: string = '--no-background-highlighted-color-black-icon';
  private static readonly lightBackgroundColorForeground: string = '--light-background-color-foreground';
  private static readonly lightBackgroundColorForegroundSubtitle: string = '--light-background-color-foreground-subtitle';
  private static readonly lightBackgroundColorForegroundHeader: string = '--light-background-color-foreground-header';
  private static readonly lightBackgroundColorForegroundSearch: string = '--light-background-color-foreground-search';
  private static readonly lightBackgroundColorForegroundIcon: string = '--light-background-color-foreground-icon';
  private static readonly lightBackgroundColorForegroundLanguageIcon: string = '--light-background-color-foreground-language-icon';
  private static readonly lightBackgroundColorBackground: string = '--light-background-color-background';
  private static readonly lightBackgroundColorBackgroundSearch: string = '--light-background-color-background-search';
  private static readonly lightBackgroundColorBackgroundcart: string = '--light-background-color-background-cart';
  private static readonly lightBorderColorBordercart: string = '--light-border-color-border-cart';
  private static readonly lightBackgroundColorBackgroundIconFade: string = '--light-background-color-background-icon-fade';
  private static readonly lightBackgroundColorBackgroundIconPlain: string = '--light-background-color-background-icon-plain';
  private static readonly lightBackgroundColorBackgroundNoBg: string = '--light-background-color-background-no-bg';
  private static readonly lightBackgroundColorBackgroundLightGreyBg: string = '--light-background-color-background-light-grey-bg';
  private static readonly strongBackgroundColorForeground: string = '--strong-background-color-foreground';
  private static readonly strongBackgroundColorBackground: string = '--strong-background-color-background';
  private static readonly primaryFontFamily: string = '--primary-font-family';
  private static readonly secondaryFontFamily: string = '--secondary-font-family';

  public static readonly fonts = [
    'Arial', 'Codec Pro', 'Helvetica', 'Helvetica Neue', 'Roboto', 'Segoe UI'
  ];

  public static readonly defaultPrimaryFont = 'Roboto';
  public static readonly defaultSecondaryFont = 'Arial';
  public static readonly defaultNoBackgroundTextColor = '#23282c';
  public static readonly defaultLightTextColor = '#23282c';
  public static readonly defaultLightBackgroundColor = 'rgb(242, 240, 238)';
  public static readonly defaultDarkTextColor = '#fff';
  public static readonly defaultDarkBackgroundColor = '#000';
  public static readonly tenantPrimaryColor = '#23282c';
  public static readonly tenantSecondaryColor = '#23282c';

  public static readonly primaryFontKey = 'primary-font-family';
  public static readonly secondaryFontKey = 'secondary-font-family';
  public static readonly noBackgroundTextKey = 'no-background-highlighted-color';
  public static readonly lightTextKey = 'light-background-color-foreground';
  public static readonly lightBackgroundKey = 'light-background-color-background';
  public static readonly darkTextKey = 'strong-background-color-foreground';
  public static readonly darkBackgroundKey = 'strong-background-color-background';

  static setDefaultStyle(): void {
    this.setCss(this.noBackgroundHighlightedColorText, '#23282c');
    this.setCss(this.noBackgroundHighlightedColorDateText, '#23282c');
    this.setCss(this.noBackgroundHighlightedColorDateIcon, 'rgba(0,0,0,.54)');
    this.setCss(this.noBackgroundHighlightedColorHeader, '#000');
    this.setCss(this.noBackgroundHighlightedColorSubtitle, '#444');
    this.setCss(this.noBackgroundHighlightedColorSubtitle2, '#333');
    this.setCss(this.noBackgroundHighlightedColorSubtitle3, '#666');
    this.setCss(this.noBackgroundHighlightedColorSecondaryText, '#c8ced3');
    this.setCss(this.noBackgroundHighlightedColorBlackIcon, '#000000');
    this.setCss(this.lightBackgroundColorForeground, '#23282c');
    this.setCss(this.lightBackgroundColorForegroundSubtitle, '#444');
    this.setCss(this.lightBackgroundColorForegroundHeader, '#000');
    this.setCss(this.lightBackgroundColorForegroundSearch, '$blue');
    this.setCss(this.lightBackgroundColorForegroundIcon, '#000');
    this.setCss(this.lightBackgroundColorForegroundLanguageIcon, '#2f353a');
    this.setCss(this.lightBackgroundColorBackground, 'rgb(242, 240, 238)');
    this.setCss(this.lightBackgroundColorBackgroundSearch, '#ddd');
    this.setCss(this.lightBackgroundColorBackgroundcart, '#000');
    this.setCss(this.lightBorderColorBordercart, '#2f528f');
    this.setCss(this.lightBackgroundColorBackgroundIconFade, 'rgba(256, 256, 256, 0.6)');
    this.setCss(this.lightBackgroundColorBackgroundIconPlain, '#f1f1f1');
    this.setCss(this.lightBackgroundColorBackgroundNoBg, 'none');
    this.setCss(this.lightBackgroundColorBackgroundLightGreyBg, 'rgb(242, 240, 238)');
    this.setCss(this.strongBackgroundColorForeground, '#fff');
    this.setCss(this.strongBackgroundColorBackground, '#000');
    this.setCss(this.primaryFontFamily, 'Roboto');
    this.setCss(this.secondaryFontFamily, 'Roboto');
  }

  static setThemeStyles(uiProperties: any): void {
    this.setCss(this.noBackgroundHighlightedColorText, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorDateText, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorDateIcon, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorHeader, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorSubtitle, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorSubtitle2, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorSubtitle3, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorSecondaryText, uiProperties['no-background-highlighted-color']);
    this.setCss(this.noBackgroundHighlightedColorBlackIcon, uiProperties['no-background-highlighted-color']);
    this.setCss(this.lightBackgroundColorForeground, uiProperties['light-background-color-foreground']);
    this.setCss(this.lightBackgroundColorForegroundSubtitle, uiProperties['light-background-color-foreground']);
    this.setCss(this.lightBackgroundColorForegroundHeader, uiProperties['light-background-color-foreground']);
    this.setCss(this.lightBackgroundColorForegroundSearch, uiProperties['light-background-color-foreground']);
    this.setCss(this.lightBackgroundColorForegroundIcon, uiProperties['light-background-color-foreground']);
    this.setCss(this.lightBackgroundColorForegroundLanguageIcon, uiProperties['light-background-color-foreground']);
    this.setCss(this.lightBackgroundColorBackground, uiProperties['light-background-color-background']);
    this.setCss(this.lightBackgroundColorBackgroundSearch, uiProperties['light-background-color-background']);
    this.setCss(this.lightBackgroundColorBackgroundcart, uiProperties['light-background-color-background']);
    this.setCss(this.lightBorderColorBordercart, uiProperties['light-background-color-background']);
    this.setCss(this.lightBackgroundColorBackgroundIconFade, uiProperties['light-background-color-background']);
    this.setCss(this.lightBackgroundColorBackgroundIconPlain, uiProperties['light-background-color-background']);
    this.setCss(this.lightBackgroundColorBackgroundNoBg, uiProperties['light-background-color-background']);
    this.setCss(this.lightBackgroundColorBackgroundLightGreyBg, uiProperties['light-background-color-background']);
    this.setCss(this.strongBackgroundColorForeground, uiProperties['strong-background-color-foreground']);
    this.setCss(this.strongBackgroundColorBackground, uiProperties['strong-background-color-background']);
    this.setCss(this.primaryFontFamily, uiProperties['primary-font-family']);
    this.setCss(this.secondaryFontFamily, uiProperties['secondary-font-family']);
  }

  private static setCss(key: string, value: any): void {
    document.documentElement.style.setProperty(key, value);
  }
}
