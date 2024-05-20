import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreIntegrationsCustomComponent } from './store-integrations-custom.component';

describe('StoreIntegrationsCustomComponent', () => {
  let component: StoreIntegrationsCustomComponent;
  let fixture: ComponentFixture<StoreIntegrationsCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreIntegrationsCustomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreIntegrationsCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
});
