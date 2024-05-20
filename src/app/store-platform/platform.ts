export interface Tenants {
  allTenants : Tenant[];
}

export interface Tenant {
  code: string;
  name: string;
  adminSubdomain: string;
  settings: {
    logo?: string;
    commercialUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }
}

export interface TenantColor {
  primaryColor: string;
  secondaryColor: string;
}

export interface TenantLogoResponse {
  blob: Blob;
  filename: string;
}

export enum TenantSettings {
  COMMERCIAL_URL = "COMMERCIAL_URL",
  PRIMARY_BRAND_COLOR = "PRIMARY_BRAND_COLOR",
  SECONDARY_BRAND_COLOR = "SECONDARY_BRAND_COLOR",
  LOGO = "LOGO"
}