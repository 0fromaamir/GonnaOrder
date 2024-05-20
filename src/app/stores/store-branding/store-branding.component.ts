import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeUtils } from 'src/app/public/store/utils/ThemeUtils';
import { UpdateStoreSettings } from '../+state/stores.actions';

@Component({
  selector: 'app-store-branding',
  templateUrl: './store-branding.component.html',
  styleUrls: ['./store-branding.component.scss']
})
export class StoreBrandingComponent implements OnInit, OnDestroy {
  form: FormGroup = this.fb.group({
    theme: ['standard'],
    primaryFont: [ThemeUtils.defaultPrimaryFont],
    secondaryFont: [ThemeUtils.defaultSecondaryFont]
  });
  destroyed$ = new Subject<void>();
  readonly themeTypes: { key: string, text: string }[] = [
    { key: 'standard', text: 'admin.store.settings.branding.text.standard' },
    { key: 'customized', text: 'admin.store.settings.branding.text.customized' }
  ];
  readonly fonts = ThemeUtils.fonts.slice(0);
  colors: BrandingColor = {
    noBackgroundText: ThemeUtils.defaultNoBackgroundTextColor,
    lightText: ThemeUtils.defaultLightTextColor,
    lightBackground: ThemeUtils.defaultLightBackgroundColor,
    darkText: ThemeUtils.defaultDarkTextColor,
    darkBackground: ThemeUtils.defaultDarkBackgroundColor
  };
  existingStyles: string;
  existingTheme: string;
  hasAnyPropertyChanged: boolean;

  constructor(private fb: FormBuilder, private store: Store<StoresState>) { }

  ngOnInit(): void {
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.existingStyles = s.settings.UI_BRANDING_STYLES;
      this.initializeData(s.settings.UI_BRANDING_STYLES);
      this.existingTheme = s.settings.UI_BRANDING_STYLES ? 'customized' : 'standard';
    });
  }

  private setDefaultProperties(theme: string): void {
    this.form.patchValue({
      theme: theme,
      primaryFont: ThemeUtils.defaultPrimaryFont,
      secondaryFont: ThemeUtils.defaultSecondaryFont
    });
    this.colors.noBackgroundText = ThemeUtils.defaultNoBackgroundTextColor;
    this.colors.lightText = ThemeUtils.defaultLightTextColor;
    this.colors.lightBackground = ThemeUtils.defaultLightBackgroundColor;
    this.colors.darkText = ThemeUtils.defaultDarkTextColor;
    this.colors.darkBackground = ThemeUtils.defaultDarkBackgroundColor;
  }

  private initializeData(styles?: string): void {
    if (styles) {
      this.setCustomizedTheme(styles);
    } else {
      this.setDefaultProperties('standard');
    }
  }

  private setCustomizedTheme(styles: string): void {
    const style = JSON.parse(styles);
    this.form.patchValue({
      theme: 'customized',
      primaryFont: style['primary-font-family'],
      secondaryFont: style['secondary-font-family']
    });
    this.colors.noBackgroundText = style['no-background-highlighted-color'];
    this.colors.lightText = style['light-background-color-foreground'];
    this.colors.lightBackground = style['light-background-color-background'];
    this.colors.darkText = style['strong-background-color-foreground'];
    this.colors.darkBackground = style['strong-background-color-background'];
  }

  onThemeChange(theme: string): void {
    this.setDefaultProperties(theme);
  }

  themeSelected(): string {
    return this.form.get('theme')?.value;
  }

  getValue(control: string): string {
    return this.form.get(control)?.value;
  }

  getFont(): string {
    let font = '';
    const primaryFont = this.form.get('primaryFont')?.value;
    const secondaryFont = this.form.get('secondaryFont')?.value;
    if (primaryFont) {
      font += `${primaryFont},`;
    }
    if (secondaryFont) {
      font += `${secondaryFont},`;
    }
    font += 'Roboto, sans-serif';
    return font;
  }

  onBrandingSave(): void {
    if (this.getValue('theme') === 'standard') {
      this.setDefaultProperties('standard');
      this.store.dispatch(new UpdateStoreSettings({ UI_BRANDING_STYLES: null }));
    } else {
      this.saveCustomizedTheme();
    }
    this.hasAnyPropertyChanged = false;
  }

  private saveCustomizedTheme(): void {
    const data = {};
    data[ThemeUtils.primaryFontKey] = this.getValue('primaryFont');
    data[ThemeUtils.secondaryFontKey] = this.getValue('secondaryFont');
    data[ThemeUtils.noBackgroundTextKey] = this.colors.noBackgroundText;
    data[ThemeUtils.lightTextKey] = this.colors.lightText;
    data[ThemeUtils.lightBackgroundKey] = this.colors.lightBackground;
    data[ThemeUtils.darkTextKey] = this.colors.darkText;
    data[ThemeUtils.darkBackgroundKey] = this.colors.darkBackground;
    this.store.dispatch(new UpdateStoreSettings({ UI_BRANDING_STYLES: JSON.stringify(data) }));
  }

  buttonEnabled(): boolean {
    const currentTheme = this.getValue('theme');
    if (currentTheme === 'standard') {
      return currentTheme !== this.existingTheme;
    } else {
      return this.hasAnyPropertyChanged;
    }
  }

  reset(): void {
    if (this.existingStyles) {
      this.setCustomizedTheme(this.existingStyles);
    } else {
      this.setDefaultProperties(this.getValue('theme'));
    }
    this.hasAnyPropertyChanged = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
