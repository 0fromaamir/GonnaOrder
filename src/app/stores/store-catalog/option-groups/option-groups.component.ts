import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StoresCatalogService } from '../stores-catalog.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CatalogState } from '../+state/stores-catalog.reducer';
import { Store, select } from '@ngrx/store';
import { getCatalogOverview } from '../+state/stores-catalog.selectors';
import { getSelectedStore } from '../../+state/stores.selectors';
import { Category } from '../stores-catalog';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';

@Component({
  selector: 'app-option-groups',
  templateUrl: './option-groups.component.html',
  styleUrls: ['./option-groups.component.scss']
})
export class OptionGroupsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  private storeId: number;
  private catalogId: number;
  optionGroups: Category[];
  hideButtonForStandardUser: boolean;
  constructor(
    private router: Router,
    private storesCatalogService: StoresCatalogService,
    private catalog: Store<CatalogState>,
    private store: Store<any>
  ) {}

  ngOnInit(): void {
    const catalog$ = this.catalog.pipe(select(getCatalogOverview));
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$),
    ).subscribe(s => {
      this.storeId = s.id;
      catalog$.subscribe(data => {
        if (data) {
          this.catalogId = data && data.catalogId ? data.catalogId : 0;
          this.storesCatalogService.listCatalogCategories(this.catalogId, this.storeId)
          .pipe(takeUntil(this.destroy$)).subscribe(result => {
            this.optionGroups = result.filter(c => c.hierarchyLevel === 'CHILD');
          });
        }
      });
    });

    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.storeRoles && this.storeId && s.storeRoles[+this.storeId] === 'STORE_STANDARD') {
        this.hideButtonForStandardUser = true;
      }
    });
  }

  goToOptionGroup(mode: string, group?: Category): void {
    const queryParams = { sourcePage: 'OPTION_GROUPS' };
    if (mode === 'add') {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childCategory/CREATE_CATEGORY`], {
        queryParams
      });
    } else {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childCategory/${group.categoryId}`], {
        queryParams
      });
    }
  }

  loadCatalogOptionGrpPage(importMode) {
    const qParam = { importMode, sourcePage: 'option-group' };
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/upload`], { queryParams: qParam });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
