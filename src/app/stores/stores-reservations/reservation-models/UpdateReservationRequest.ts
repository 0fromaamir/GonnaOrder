
export interface UpdateReservationRequest{
  id: number;
  storeId: number;
  arrivalTime: string;
  departureTime: string;
  numberOfPeople: number;
  name: string;
  phone: string;
  email: string;
  location: any;
  status: string;
  comment: string;
  occasion: string;
  reason: string;
}
