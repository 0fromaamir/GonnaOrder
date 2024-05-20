import { async, ComponentFixture, TestBed } from '@angular/core/testing';


import { PrintersListComponent } from './printers-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PrintersListComponent', () => {
  let component: PrintersListComponent;
  let fixture: ComponentFixture<PrintersListComponent>;

  const storeMock = {
    pipe() {
      return of({ data: [] });
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintersListComponent ],
      imports: [
        SharedModule, 
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/translations/i18n/admin-translation.', '.json'),
              deps: [HttpClient]
          }
        })],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
