
export interface ClientStoreLocation {
  id: number;
  label: string;
  description?: string;
  comment?: string;
  locationType?: string;
  createdAt?: string;
  updatedAt?: string;
  openTap?: boolean;
  customerPinCode?: string;
  openedAt?: string;
  status?: string;
  tapId?: string;
  isPinValid?: boolean;
  externalId?: string;
  longitude?: number;
  latitude?: number;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postCode?: string;
  region?: string;
  city?: string;
  email?: string;
  allowCustomerReservation?: boolean;
  reservationPriority?: number;
}

export interface ClientStoreLocationRequest {
  label: string;
  id?: number;
  description?: string;
  comment?: string;
  maxCapacity?: number;
  minCapacity?: number;
  reservationPriority?: number;
  locationType?: string;
  openTap?: boolean;
  allowCustomerReservation?: boolean;
  customerPinCode?: string;
  openedAt?: string;
  status?: string;
  tapId?: string;
  externalId?: string;
  longitude?: number;
  latitude?: number;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  postCode?: string;
  region?: string;
  city?: string;
  email?: string;
}
