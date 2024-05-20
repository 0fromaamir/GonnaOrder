import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CategoryState } from '../+state/stores-catalog.reducer';
import { getCatalogOverview, getCategoryStatus, getStationData } from '../+state/stores-catalog.selectors';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { Cart } from 'src/app/public/store/+state/stores.reducer';
import { DeleteStation, SaveStation, UpdateStation } from '../+state/stores-catalog.actions';
import { DeleteDialogData, Station } from '../stores-catalog';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-child-station',
  templateUrl: './child-station.component.html',
  styleUrls: ['./child-station.component.scss']
})
export class ChildStationComponent implements OnInit, OnDestroy {
  isCreateStation: boolean = false;
  stationId: string | number = '';
  catalogId: number = 0;
  storeId: number = 0;
  categoryStatus: string;
  destroyed$ = new Subject<void>();
  category$: Observable<any>;
  station: Station;
  stationCategoryForm: FormGroup;
  disableForm: boolean;
  constructor(
    private route: ActivatedRoute,
    private category: Store<CategoryState>,
    private router: Router,
    private fb: FormBuilder,
    private store: Store<Cart>,
    private translate: TranslateService,
    public dialog: MatDialog) { }

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap(params => {
          this.stationId = params.stationId;
          this.catalogId = params.catalogId;
          this.storeId = params.id;
          return [this.stationId, this.catalogId, this.storeId];
        }),
        takeUntil(this.destroyed$)
      ).subscribe(data => {
        this.createOrResetForm();
        this.disableForm = false;
        if (this.stationId === 'createStation') {
          this.isCreateStation = true;
        } else {
          this.category.select(getStationData).subscribe(data => {
            if(data) {
              this.isCreateStation = false;
              this.station = data;
              this.stationCategoryForm?.patchValue({
                name: this.station.name
              })
            }
          })
        }
        this.category
        .pipe(
          select(getCategoryStatus),
          takeUntil(this.destroyed$),
        )
        .subscribe(s => {
          this.categoryStatus = s;
        });
      })}

  getControl(name: string) {
    if(this.stationCategoryForm){
      return this.stationCategoryForm?.get(name);
    }
  }

  createOrResetForm() {
    this.stationCategoryForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
    }, { validator: CustomValidators.checkForOnlySpaces('name') });
  }

  goBack(event) {
    if (event !== undefined) {
      event.preventDefault();
    }
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/station`])
  }

  onStationSave() {
    this.stationCategoryForm.markAllAsTouched();
    if(this.stationCategoryForm.valid){
      if(!this.isCreateStation){
        this.category.dispatch(new UpdateStation(this.stationCategoryForm.value, this.storeId, Number(this.stationId)));
      }else {
        this.category.dispatch(new SaveStation(this.stationCategoryForm.value, this.storeId))
      }
    }
  }

  onDeleteStation() {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.catalog.station.confirmDeleteStation');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action !== undefined) {
        if (action === 'DELETE') {
          this.category.dispatch(new DeleteStation(this.storeId, Number(this.stationId)));
        }
      }
    });
    
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
