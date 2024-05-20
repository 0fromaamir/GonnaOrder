import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor, FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators,
} from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { ReferenceDataService } from 'src/app/api/reference-data.service';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PhoneInputComponent,
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: PhoneInputComponent,
    },
  ],
})
export class PhoneInputComponent
  implements ControlValueAccessor, Validator, OnInit {
  @Input() countryCode: string;
  @Input() required: boolean;
  @Input() id: string;
  @Input() invalidSubmit: boolean;
  @Input() matForm = false;
  @Input() placeholder = true;
  @Input() minHeight = '54';
  @Input() gap = '0';
  @Output() inputChange: EventEmitter<any> = new EventEmitter();
  @Output() phoneInputChange: EventEmitter<any> = new EventEmitter();

  invalid = false;
  errors: any;

  @ViewChild('phoneTextInput') phoneTextInput: ElementRef;

  selectedCountryCode: string;
  phoneNumber = '';
  selectedCountry: any;
  initialCountry: any;
  countryCodes = [];
  phoneControl = new FormControl('', [Validators.required]);

  touched = false;
  disabled = false;
  onTouched = () => { };
  onChange = (phoneNumber: any) => {
    this.phoneInputChange.emit(phoneNumber);
  }

  constructor(private referenceDataService: ReferenceDataService) {
  }

  ngOnInit() {
    this.referenceDataService
      .getCountries()
      .subscribe((country) => {
        this.countryCodes = country.data.map(({ name, code, phoneCode }) => ({
          name,
          code: phoneCode,
          isoCode: code?.toLowerCase()
        }
        ));
        this.selectedCountry = this.initialCountry = this.countryCodes.find(c => c.code === this.countryCode) || {};
        this.selectedCountryCode = this.selectedCountry.code || '1';
        if (this.phoneNumber?.trim().startsWith('+')) {
          this.updatePhoneNumber();
        } else {
          this.updateCountryCode();
        }
      });
  }

  select(value: any) {
    this.selectedCountry = value;
    this.updateCountryCode();
  }

  updateCountryCode() {
    const regex = new RegExp(`^(${'\\+' + this.selectedCountryCode})`);
    this.phoneNumber =
      `+${this.selectedCountry.code}` + this.phoneNumber.replace(regex, '').replace(/\+/g, '');
    this.selectedCountryCode = this.selectedCountry.code;
    this.onChange(this.phoneNumber);
    setTimeout(() => this.inputChange.emit(), 10);
  }

  writeValue(phoneNumber: string): void {
    if (phoneNumber?.trim().startsWith('+') || !this.selectedCountryCode) {
      this.phoneNumber = phoneNumber?.trim();
    } else {
      this.phoneNumber = `+${this.selectedCountryCode}` + phoneNumber?.trim();
    }
    this.updatePhoneNumber();
  }

  updatePhoneNumber() {
    this.markAsTouched();

    let match;

    if (this.phoneNumber.indexOf(`+1`) === 0) {
      match = this.countryCodes.find((c) => c.isoCode === 'us');
    } else {
      match = this.countryCodes.find(
        (c) => this.phoneNumber.indexOf(`+${c.code}`) === 0
      );
    }

    if (match?.code !== this.selectedCountryCode) {
      this.selectedCountry = match;
      this.selectedCountryCode = match?.code;
    }

    this.onChange(this.phoneNumber);
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }


  validate(control: AbstractControl): ValidationErrors | null {
    const phoneNumber: string = control.value;
    this.invalid = false;
    this.errors = null;

    if (
      !this.required &&
      (!this.selectedCountryCode || phoneNumber == `+${this.selectedCountryCode}` || phoneNumber.length == 0)
    ) {
      this.errors = null;
    } else if (this.required && phoneNumber.length === 0) {
      this.errors = { required: true };
    } else {
      try {
        const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
        const regex = /^[0-9 \+\-]+$/;
        if (
          !phoneUtil.isValidNumber(phoneUtil.parse(phoneNumber)) ||
          !regex.test(phoneNumber)
        ) {
          this.errors = { invalidPhone: { phoneNumber } };
        }
      } catch (e) {
        this.errors = { invalidPhone: { phoneNumber } };
      }
    }

    this.invalid = this.errors != null;
    return this.errors;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  inputFocus() {
    this.phoneTextInput?.nativeElement.focus();
  }

  showErrors() {
    return (this.invalidSubmit || this.phoneNumber !== `+${this.selectedCountryCode}`) && this.errors;
  }
}
