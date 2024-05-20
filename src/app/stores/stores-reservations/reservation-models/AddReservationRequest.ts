import {ReservationStatus} from './reservation-status';

export interface AddReservationRequest{
  storeId: number;
  arrivalTime: string;
  departureTime: string;
  numberOfPeople: number;
  name: string;
  phone: string;
  email: string;
  location: any;
  status: ReservationStatus;
  comment: string;
  occasion: string;
  reason: string;
}
