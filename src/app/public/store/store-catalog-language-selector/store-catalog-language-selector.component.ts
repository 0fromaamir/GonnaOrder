import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { CatalogLanguagesList, CatalogState } from '../+state/stores.reducer';
import { getAvailableCatalogLanguages, getSelectedLang, getCurrentCartUuid } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Lang, ClientStore } from 'src/app/stores/stores';
import { Observable, Subject, combineLatest } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import {SelectCatalogLanguage, ViewStateUpdateUserLanguage} from '../+state/stores.actions';
import { getSelectedStore } from '../+state/stores.selectors';
import { DomSanitizer } from '@angular/platform-browser';
import {StoresService} from '../../../stores/stores.service';
import {TranslateService} from '@ngx-translate/core';
import {DateAdapter} from '@angular/material/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-store-catalog-language-selector',
  templateUrl: './store-catalog-language-selector.component.html',
  styleUrls: ['./store-catalog-language-selector.component.scss']
})
export class StoreCatalogLanguageSelectorComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<void> = new Subject<void>();
  selectedStore: ClientStore;
  orderUuid: string;
  availableCatalogLanguages: Lang[];
  selectedLang: string;
  newLang: string;
  langSelectionForm: FormGroup;
  @ViewChild('langSelectorModal') langModal: ElementRef;
  @Input() haveBackground = false;
  availableCatalogLanguages$: Observable<CatalogLanguagesList>;
  selectedLang$: Observable<string>;
  userInterfaceLanguageOption = '';
  userInterfaceLanguages: any[];
  lang: string;
  constructor(private store: Store<CatalogState>, private router: Router, private activatedRoute: ActivatedRoute, private dateAdapter: DateAdapter<any>, private translate: TranslateService, private storesService: StoresService, private fb: FormBuilder, private renderer: Renderer2, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.availableCatalogLanguages = null;
    this.selectedLang = null;
    this.newLang = null;
    this.langSelectionForm = this.fb.group({
      availableCatalogLanguages: ['']
    });

    this.availableCatalogLanguages$ = this.store.select(getAvailableCatalogLanguages);
    this.selectedLang$ = this.store.select(getSelectedLang);
    // select store catalog languages
    combineLatest([this.store.select(getSelectedStore)
      , this.store.select(getCurrentCartUuid)
      , this.store.select(getAvailableCatalogLanguages)
      , this.store.select(getSelectedLang)])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state[0] && state[1]) {
          this.selectedStore = state[0];
          this.orderUuid = state[1];
        }
        if (state && state[2] && state[2].status === 'FETCHED' && state[3]) {
          this.availableCatalogLanguages = state[2].data;
          this.selectedLang = state[3];
          this.langSelectionForm.get('availableCatalogLanguages').setValue(this.selectedLang);
        }
      });
    this.storesService.getUserInterfaceLanguages().subscribe(data => {
      this.userInterfaceLanguages = data;
    });
  }
  private loadLanguage(locale) {
    return import(`./../../translations/i18n/translation.${locale}.json`)
      .then(lang => {
        this.translate.setTranslation(locale, {...lang});
        this.translate.setDefaultLang(locale);
        switch (locale) {
          case 'en':
          case 'fr':
          case 'nl':
          case 'el':
          case 'ja':
            this.lang = locale;
            break;
          default:
            this.lang = 'en';
        }
        // set datepicker locale with user language
        if (this.lang) {
          this.dateAdapter.setLocale(this.lang);
        }
        // store user language to view state...
        this.store.dispatch(new ViewStateUpdateUserLanguage(this.lang, {
          src: 'StoreLoadingComponent',
          description: 'Load language file and set user language to view state'
        }));
      });
  }
  setNewCatalogLanguage(event) {
    event.preventDefault();
    this.store.dispatch(new SelectCatalogLanguage(this.newLang, {
      src: 'StoreCatalogLanguageSelectorComponent',
      description: 'Catalog language selected'
    }));
    this.store.select(getSelectedStore).subscribe((clientStore) => {
      this.userInterfaceLanguageOption = clientStore?.settings.CUSTOMER_UI_LANGUAGE_OPTION;
      if ( this.userInterfaceLanguageOption === 'SELECTED-CATALOG')
      {
          this.loadLanguage(this.newLang)
            .catch(_ => {
              this.loadLanguage('en');
            });
      }
    });
    this.OnCloseLangModal(null);
    this.changeQueryParams();
  }
  public changeQueryParams() {
    if ( this.userInterfaceLanguageOption === 'SELECTED-CATALOG') {
      const queryParams = {ulang: this.newLang};
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams,
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        }
      );
    }
  }
  OnChooseCatalogLang(event) {
    if (this.availableCatalogLanguages.length === 1) {
      return;
    }
    event.preventDefault();
    this.renderer.removeClass(this.langModal.nativeElement, 'hide');
  }

  OnCheckOutsideClose($event, refEl) {
    if ($event.target === refEl) {
      this.OnCloseLangModal($event);
    }
  }

  OnCloseLangModal(event) {
    if (event != null) {
      event.preventDefault();
    }
    this.langSelectionForm.get('availableCatalogLanguages').setValue(this.selectedLang);
    this.renderer.addClass(this.langModal.nativeElement, 'hide');
  }

  getBackgroundImage(url) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${url}')`);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
