import {Reservation} from './reservation';

export interface EventData{
  tableId: string;
  label: string;
  maxCapacity: number;
  reservations: Reservation[];
}
