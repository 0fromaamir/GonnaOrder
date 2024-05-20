import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { select, Store } from "@ngrx/store";
import { takeUntil } from "rxjs/operators";
import { getSelectedStore } from '../../+state/stores.selectors';
import { UpdateStoreSettings } from '../../+state/stores.actions';

@Component({
  selector: 'app-store-integrations-poster',
  templateUrl: './store-integrations-poster.component.html',
  styleUrls: ['./store-integrations-poster.component.scss']
})
export class StoreIntegrationsPosterComponent implements OnInit {

  helpUrl: string;
  posterSection = 'poster-dashboard';
  posterForm: FormGroup;
  destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'poster';
    this.posterForm = this.fb.group({
      JOINPOSTER_SPOTID: ['', [Validators.required, Validators.maxLength(255)]],
      JOINPOSTER_TOKEN: ['', [Validators.required, Validators.maxLength(64)]],
      JOINPOSTER_PHONENUMBER: ['', [Validators.required, Validators.maxLength(64), Validators.pattern('^[0-9]*$')]],
      JOINPOSTER_ENABLED: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.JOINPOSTER_TOKEN != null) {
        this.posterSection = 'poster-connected';
      }
      this.posterForm.get('JOINPOSTER_SPOTID').setValue(s.settings.JOINPOSTER_SPOTID);
      this.posterForm.get('JOINPOSTER_TOKEN').setValue(s.settings.JOINPOSTER_TOKEN);
      this.posterForm.get('JOINPOSTER_PHONENUMBER').setValue(s.settings.JOINPOSTER_PHONENUMBER);
      this.posterForm.get('JOINPOSTER_ENABLED').setValue(s.settings.JOINPOSTER_ENABLED);
    });
  }

  getControl(name: string) {
    return this.posterForm.get(name);
  }

  connectToPoster() {
    const formObj = this.posterForm.getRawValue();
    formObj.JOINPOSTER_ENABLED = !formObj.JOINPOSTER_ENABLED;
    this.posterForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(this.posterForm.getRawValue()));
    this.posterSection = 'poster-connected';
  }

  disconnectToPoster() {
    const formObj = this.posterForm.getRawValue();
    formObj.JOINPOSTER_SPOTID = null;
    formObj.JOINPOSTER_TOKEN = null;
    formObj.JOINPOSTER_PHONENUMBER = null;
    formObj.JOINPOSTER_ENABLED = true;
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.posterSection = 'poster-dashboard';
  }

  togglePoster() {
    const formObj = this.posterForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.posterSection = 'poster-connected';
  }
}
