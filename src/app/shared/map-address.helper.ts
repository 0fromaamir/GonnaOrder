import { FormGroup } from '@angular/forms';

const toName = (a: any) => a.long_name;

export const parseAddress = (components: any[], form: FormGroup, address: string): Promise<void> => {
  return new Promise((resolve) => {
    setPostalCode(components, form);
    getCity(components).then(city => {
      form.get('city').setValue(city);
      getRegion(components, city).then(region => {
        form.get('region').setValue(region);
        trimAddress(components, form, address).then(() => resolve());
      });
    });
  });
};

const trimAddress = (components: any[], form: FormGroup, address: string): Promise<void> => {
  return new Promise((resolve) => {
    getCityOrCountryIndex(components, address).then(idx => {
      if (idx > 0) {
        form.get('addressLine1').setValue(address.substring(0, idx - 2));
      }
      resolve();
    });
  });
};

const getCityOrCountryIndex = (components: any[], address: string): Promise<number> => {
  return new Promise((resolve) => {
    let idx = 0;

    const countries: string[] = components.filter(a => a.types.includes('country')).map(toName);
    if (countries && countries.length > 0) {
      countries.forEach(country => {
        if (address.includes(country)) {
          idx = address.indexOf(country);
          return;
        }
      });
    }
    
    const cities: string[] = components
      .filter(a => a.types.includes('postal_town') || a.types.includes('locality'))
      .map(toName);
    if (cities && cities.length > 0) {
      cities.forEach(city => {
        if (address.includes(city)) {
          idx = address.indexOf(city);
          return;
        }
      });
    }

    resolve(idx);
  });
};

const setPostalCode = (components: any[], form: FormGroup): void => {
  const postalCodes: string[] = components
    .filter(a => a.types.includes('postal_code') || a.types.includes('postal_code_prefix'))
    .map(toName);
  if (postalCodes && postalCodes.length > 0) {
    postalCodes.forEach(code => form.get('postCode').setValue(code));
  }
};

const getCity = (components: any[]): Promise<string> => {
  return new Promise((resolve) => {
    const postalTowns: string[] = components.filter(a => a.types.includes('postal_town')).map(toName);
    const localities: string[] = components.filter(a => a.types.includes('locality')).map(toName);
    const cities = [...new Set([].concat(...[postalTowns, localities]))];
    if (cities && cities.length > 0) {
      resolve(cities.join(', '));
    } else {
      resolve('');
    }
  });
};

const getRegion = (components: any[], city: string): Promise<string> => {
  return new Promise((resolve) => {
    let region = '';
    const regionFilter = (a: any, level: string) => a.types.includes(level) && city !== a.long_name;
    const l3: string[] = components.filter(a => regionFilter(a, 'administrative_area_level_3')).map(toName);
    const l2: string[] = components.filter(a => regionFilter(a, 'administrative_area_level_2')).map(toName);
    const l1: string[] = components.filter(a => regionFilter(a, 'administrative_area_level_1')).map(toName);
    const regions = [...new Set([].concat(...[l3, l2, l1]))];
    if (regions && regions.length > 0) {
      region = regions.join(', ');
    }
    if (region !== city) {
      resolve(region);
    } else {
      resolve('');
    }
  });
};
