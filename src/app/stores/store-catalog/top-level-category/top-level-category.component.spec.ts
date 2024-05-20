import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopLevelCategoryComponent } from './top-level-category.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { of } from 'rxjs';

describe('TopLevelCategoryComponent', () => {
  let component: TopLevelCategoryComponent;
  let fixture: ComponentFixture<TopLevelCategoryComponent>;
  const storeMock = {
    pipe() {
      return of({});
    }
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopLevelCategoryComponent ],
      imports: [RouterTestingModule,
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
        },
        { provide: MatDialog, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopLevelCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
