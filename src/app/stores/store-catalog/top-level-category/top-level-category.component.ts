import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Category, SaveCategoryPositionView } from '../stores-catalog';
import { Router } from '@angular/router';
import { StoresCatalogService } from '../stores-catalog.service';
import { CatalogState, CategoryState } from '../+state/stores-catalog.reducer';
import { Store, select } from '@ngrx/store';
import { getCatalogOverview } from '../+state/stores-catalog.selectors';
import { getSelectedStore } from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { SaveCategoryPosition } from '../+state/stores-catalog.actions';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-top-level-category',
  templateUrl: './top-level-category.component.html',
  styleUrls: ['./top-level-category.component.scss']
})
export class TopLevelCategoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();
  private storeId: number;
  private catalogId: number;
  categories: Category[];

  constructor(
    private router: Router,
    private storesCatalogService: StoresCatalogService,
    private catalog: Store<CatalogState>,
    private store: Store<any>,
    private category: Store<CategoryState>
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
          this.catalogId = data && data.catalogId? data.catalogId : 0;
          this.storesCatalogService.listCatalogCategories(this.catalogId, this.storeId)
          .pipe(takeUntil(this.destroy$)).subscribe(result => {
            this.categories = result.filter(c => c.hierarchyLevel === 'TOP');
          });
        }
      });
    });
  }

  goToCategory(mode: string, category?: Category): void {
    if (mode === 'add') {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/category/CREATE_CATEGORY`], {
        queryParams: {
          type: 'top'
        }
      });
    } else {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/category/${category.categoryId}`]);
    }
  }

  savePosition(direction, index) {
    if (direction === 'DOWN') {
      moveItemInArray(this.categories, index, index + 1);
    } else {
      moveItemInArray(this.categories, index - 1, index);
    }
    let i = 1;
    let categoryPositionRequest: SaveCategoryPositionView;
    categoryPositionRequest = { categories: [] };
    const requestList = [];
    this.categories.forEach((category) => {
      category.position = i;
      i++;
      requestList.push({
        categoryId: category.categoryId,
        position: category.position,
      });
    });
    categoryPositionRequest.categories = requestList;
    this.category.dispatch(
      new SaveCategoryPosition(
        categoryPositionRequest,
        this.storeId.toString(),
        this.catalogId.toString()
      )
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
