import {ReservationStatus} from './reservation-status';
import {Location} from './location';

export interface Reservation {
  name: string;
  id: number;
  uuid: string;
  storeId: number;
  reservationNumber: number;
  arrivalTime: string;
  departureTime: string;
  numberOfPeople: number;
  phone: string;
  email: string;
  status: ReservationStatus;
  comment: string;
  occasion: string;
  reason: string;
  createdAt: string;
  location: Location;

}

