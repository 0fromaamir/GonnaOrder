export interface Schedule {
  id: number;
  name: string;
  availabilities: ScheduleAvailability[];
}

export interface ScheduleAvailability {
  id: number;
  daysOfWeek: any[];
  endTime: string;
  startTime: string;
  type?: string;
  date?: string;
}

export interface SpecialSchedule {
  id: number;
  schedule: Schedule;
  type: string;
}
