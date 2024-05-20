import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { CatalogState } from 'src/app/public/store/+state/stores.reducer';
import { ImportCatalog } from '../+state/stores-catalog.actions';

@Component({
  selector: 'app-catalog-link',
  templateUrl: './catalog-link.component.html',
  styleUrls: ['./catalog-link.component.scss'],
})
export class CatalogLinkComponent implements OnInit, OnDestroy {
  catalogImportForm: FormGroup;
  storeId: any;
  private destroyed$ = new Subject();

  catalogLinks = [
    { key: 'UBEREATS', label: 'Uber Eats', url: 'https://www.ubereats.com/' },
    { key: 'DELIVEROO', label: 'Deliveroo', url: 'https://www.deliveroo' },
    { key: 'WOLT', label: 'Wolt', url: 'https://www.wolt.com/' },
    { key: 'EFOOD.GR', label: 'e-food.gr', url: 'https://www.e-food.gr/' },
    { key: 'FOOD.CY', label: 'foody.cy', url: 'https://foody.com.cy/' },
  ];

  constructor(
    private actRoute: ActivatedRoute,
    private fb: FormBuilder,
    private catalog: Store<CatalogState>
  ) {}

  ngOnInit(): void {
    const params = this.actRoute.params as any;
    this.storeId = params._value.id;

    this.catalogImportForm = this.fb.group({
      externalDomain: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(20)]),
      ],
      externalReference: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100),
        ]),
      ],
    });

    this.catalogImportForm.get('externalDomain').valueChanges.subscribe((v) => {
      if (v && v.length > 0) {
        const catalogLink = this.catalogLinks.find((x) => x.key === v);
        if (catalogLink != null) {
          this.catalogImportForm.get('externalReference').setValue(catalogLink.url);
          this.catalogImportForm.get('externalReference').setValidators([Validators.minLength(catalogLink.url.length + 1)]);
          this.catalogImportForm.get('externalReference').updateValueAndValidity();
        }
      } else {
        this.catalogImportForm.get('externalReference').setValue('');
      }
    });
  }

  getControl(name: string) {
    return this.catalogImportForm.get(name);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  importCatalog() {
    this.catalogImportForm.markAllAsTouched();
    if (this.catalogImportForm.valid) {
      this.catalog.dispatch(
        new ImportCatalog(this.catalogImportForm.getRawValue(), this.storeId)
      );
    }
  }
}
