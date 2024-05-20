import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { CreateTenant, DeleteTanentLogo, DownloadTenantLogo, UpdateTenant } from '../+state/platform.actions';
import { TenantColor, TenantSettings } from '../platform';
import { getSelectedTenant } from '../+state/platform.selectors';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeUtils } from 'src/app/public/store/utils/ThemeUtils';
import {ImageUploadComponent} from 'src/app/shared/image-upload/image-upload.component';
import { CustomValidators } from 'src/app/shared/custom.validators';

@Component({
  selector: 'app-child-platform',
  templateUrl: './child-platform.component.html',
  styleUrls: ['./child-platform.component.scss']
})
export class ChildPlatformComponent implements OnInit, OnDestroy{
  isCreateTenant: boolean = false;
  tenantCode: string = '';
  destroyed$ = new Subject<void>();
  tenantForm: FormGroup;
  disableForm: boolean;
  tenantLogo: string;
  tenantLogoFile: File;
  @ViewChild(ImageUploadComponent)
  private imageUploadComponent!: ImageUploadComponent;
  colors: TenantColor = {
    primaryColor: ThemeUtils.tenantPrimaryColor,
    secondaryColor: ThemeUtils.tenantSecondaryColor,
  };
  hasAnyPropertyChanged: boolean;
  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private store: Store<any>){}

  ngOnInit() {
    this.route.params
    .pipe(
      switchMap(params => {
        this.tenantCode = params.tenantCode;
        return of(this.tenantCode);
      }),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(data => {
      this.createOrResetForm();
      this.disableForm = false; 
      if(this.tenantCode === 'createTenant'){
        this.isCreateTenant = true;
      }else {
        this.store.select(getSelectedTenant).subscribe(data => {
          if(data.status === 'LOADED') {
            const logo = data.selectedTenant.settings[TenantSettings.LOGO];
            const primaryColor = data.selectedTenant.settings[TenantSettings.PRIMARY_BRAND_COLOR];
            const secondaryColor = data.selectedTenant.settings[TenantSettings.SECONDARY_BRAND_COLOR];
            const commercialUrl = data.selectedTenant.settings[TenantSettings.COMMERCIAL_URL];
            this.tenantForm?.patchValue({
              code: data.selectedTenant.code,
              name: data.selectedTenant.name,
              adminSubdomain: data.selectedTenant.adminSubdomain,
              commercialUrl: commercialUrl ? commercialUrl : ''
            })
            this.colors.primaryColor = primaryColor ? primaryColor : ThemeUtils.tenantPrimaryColor;
            this.colors.secondaryColor = secondaryColor ? secondaryColor : ThemeUtils.tenantSecondaryColor;
            this.tenantLogo = logo ? logo : null;
          }
        })
      }
    });
  }

  createOrResetForm() {
    this.tenantForm = this.fb.group({
      code: ['', Validators.compose([Validators.required, Validators.maxLength(128)])],
      name: ['', Validators.compose([Validators.required, Validators.maxLength(128)])],
      adminSubdomain: ['', Validators.compose([Validators.required, Validators.maxLength(128)])],
      commercialUrl: ['', Validators.compose([Validators.maxLength(128), Validators.pattern('^(https?|http)://[^ "]+$')])]
    }, { validator: [CustomValidators.checkForOnlySpaces('name'), CustomValidators.checkForOnlySpaces('code'), CustomValidators.checkForOnlySpaces('adminSubdomain') ] });
  }

  getControl(name: string) {
    if(this.tenantForm){
      return this.tenantForm?.get(name);
    }
  }

  onTenantSave(){
    this.tenantForm.markAllAsTouched();
    if(this.tenantForm.valid){
      const payload = {...this.tenantForm.getRawValue()}
      if(this.isCreateTenant){
        this.store.dispatch(new CreateTenant(payload));
      }else {
        payload.primaryColor = this.colors.primaryColor;
        payload.secondaryColor = this.colors.secondaryColor;
        this.store.dispatch(new UpdateTenant(this.tenantCode, payload, this.tenantLogoFile))
      }
    }
  }

  isButtonActive(){
    const currentUrl = this.router.url;
    const queryParams = this.route.snapshot.queryParams;
    const parts = currentUrl.split('/');
    const lastPart = parts[parts.length - 2];
    return (lastPart === 'tenant') ? true : false;
  }

  downloadImage() {
    this.store.dispatch(new DownloadTenantLogo(this.tenantLogo));
  }

  onTenantLogoUpload(file: File) {
    this.tenantLogoFile = file;
  }
  onTenantRemoveLogoImage(a) {
    this.store.dispatch(new DeleteTanentLogo(this.tenantCode));
    if (this.imageUploadComponent.fileRef?.nativeElement?.value) {
      this.imageUploadComponent.fileRef.nativeElement.value = '';
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
