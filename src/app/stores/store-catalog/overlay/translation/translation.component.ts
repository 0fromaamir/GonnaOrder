import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslationDialogData } from '../../stores-catalog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { getOfferDetails, getCategoryDetails } from '../../+state/stores-catalog.selectors';
import { OfferState, CategoryState } from '../../+state/stores-catalog.reducer';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ClientStore } from 'src/app/stores/stores';
import { StoresState } from 'src/app/stores/+state/stores.reducer';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';


@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss']
})
export class TranslationComponent implements OnInit {
  contentItemForm: FormGroup;
  dialogMode: string;
  mode: string;
  source: string;
  default$: Observable<any>;
  store$: Observable<ClientStore>;
  showGoogleTranslateLink = false;
  selectedLangLocale: string;
  googleTranslateURL: string;
  constructor(private store: Store<StoresState>,
              public dialogRef: MatDialogRef<TranslationComponent>,
              @Inject(MAT_DIALOG_DATA) public data: TranslationDialogData,
              private fb: FormBuilder, private offerState: Store<OfferState>,
              private categoryState: Store<CategoryState>) { }

  ngOnInit() {
    this.store$ = this.store.pipe(select(getSelectedStore));
    this.contentItemForm = this.fb.group({
      name: ['', Validators.compose([Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(150)])],
      longDescription: [null, Validators.compose([Validators.maxLength(1000)])],
      languageId: ['', Validators.required],
      priceDescription: ['', Validators.compose([Validators.minLength(2), Validators.maxLength(50)])]
    });
    if (this.data.translation != null) {
      this.contentItemForm.patchValue({
        languageId: this.data.translation.languageId,
        name: this.data.translation.name,
        shortDescription: this.data.translation.shortDescription,
        longDescription: this.data.translation.longDescription,
        priceDescription: this.data.translation.priceDescription
      });
    }
    this.dialogMode = this.data.mode;
    this.source = this.data.source;
    if (this.source === 'VARIANT_OFFER') {
      this.contentItemForm.get('priceDescription').setValidators([this.getControl('priceDescription').validator, Validators.required]);
    } else {
      this.contentItemForm.get('name').setValidators([this.getControl('name').validator, Validators.required]);
    }
    if (this.dialogMode === 'CREATE') {
      if (this.source === 'OFFER' || this.source === 'CHILD_OFFER' || this.source === 'VARIANT_OFFER') {
        this.default$ = this.offerState.pipe(select(getOfferDetails));
      } else {
        this.default$ = this.categoryState.pipe(select(getCategoryDetails));
      }

    }
  }

  getControl(name: string) {
    return this.contentItemForm.get(name);
  }

  getFilteredLangList() {
    return this.data.languageList;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onDelete(contentItemForm): void {
    this.dialogRef.close({ action: 'DELETE', formData: contentItemForm });
  }

  urlEncodeString(input) {
    if (input) {
      return input.replace(/[%&#+]/g, (match) => {
        switch (match) {
          case '%':
            return '%25';
          case '&':
            return '%26';
          case '#':
            return '%23';
          case '+':
            return '%2B';
          default:
            return match;
        }
      });
    } else {
      return '';
    }
  }

  onTargetLangChange(selectLangId: number) {
    this.showGoogleTranslateLink = true;
    this.selectedLangLocale = this.data.languageList.find(l => l.id === +selectLangId).locale;
    this.default$.subscribe(z => {
      let name = this.urlEncodeString(z.name);
      let shortDesc = this.urlEncodeString(z.shortDescription);
      let priceDescription = this.urlEncodeString(z.priceDescription);
      let longDescription = this.urlEncodeString(z.longDescription);
      this.googleTranslateURL = `https://translate.google.com?view=home&op=translate&sl=auto&tl=${this.selectedLangLocale}&text=${(this.dialogMode=='CREATE' && z.name)?name:'Name'}%0A%0A${(this.dialogMode=='CREATE' && z.priceDescription)?priceDescription:'Price Description'}%0A%0A${(this.dialogMode=='CREATE' && z.shortDescription)?shortDesc:'Short Description'}%0A%0A${(this.dialogMode=='CREATE' && z.longDescription)?longDescription:'Long Description'}`;
    })
  }

  onSave(contentItemForm): void {
    this.contentItemForm.markAllAsTouched();
    if (this.contentItemForm.valid){
      this.dialogRef.close(contentItemForm);
    }
  }
}
