import { SiteSettings } from '../models/SiteSettings';
import { Student } from '../models/Student';

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface SeatSchedule {
  seatDays: string[];
  seatStartTime: string;
  seatEndTime: string;
}

interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

const DEFAULT_OPENING_HOURS: OpeningHours[] = [
  { day: 'Monday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Tuesday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Wednesday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Thursday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Friday', open: '06:00', close: '22:00', isClosed: false },
  { day: 'Saturday', open: '06:00', close: '20:00', isClosed: false },
  { day: 'Sunday', open: '08:00', close: '18:00', isClosed: false },
];

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const seatSchedulesOverlap = (
  first: SeatSchedule,
  second: SeatSchedule
): boolean => {
  const firstDays = first.seatDays.length ? first.seatDays : [...WEEK_DAYS];
  const secondDays = second.seatDays.length ? second.seatDays : [...WEEK_DAYS];
  if (!firstDays.some((day) => secondDays.includes(day))) return false;

  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
  const firstStart = validTime.test(first.seatStartTime) ? timeToMinutes(first.seatStartTime) : 0;
  const firstEnd = validTime.test(first.seatEndTime) ? timeToMinutes(first.seatEndTime) : 24 * 60;
  const secondStart = validTime.test(second.seatStartTime) ? timeToMinutes(second.seatStartTime) : 0;
  const secondEnd = validTime.test(second.seatEndTime) ? timeToMinutes(second.seatEndTime) : 24 * 60;

  return firstStart < secondEnd && secondStart < firstEnd;
};

export const getOpeningHours = async (): Promise<OpeningHours[]> => {
  const settings = await SiteSettings.findOne().select('openingHours').lean();
  return settings?.openingHours?.length
    ? settings.openingHours as OpeningHours[]
    : DEFAULT_OPENING_HOURS;
};

export const validateSeatSchedule = async (
  schedule: SeatSchedule
): Promise<string | null> => {
  const { seatDays, seatStartTime, seatEndTime } = schedule;
  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!Array.isArray(seatDays) || seatDays.length === 0) {
    return 'Select at least one day for the seat schedule.';
  }
  if (new Set(seatDays).size !== seatDays.length || seatDays.some((day) => !WEEK_DAYS.includes(day as typeof WEEK_DAYS[number]))) {
    return 'The selected seat schedule contains an invalid day.';
  }
  if (!validTime.test(seatStartTime) || !validTime.test(seatEndTime)) {
    return 'Enter a valid seat start and end time.';
  }

  const start = timeToMinutes(seatStartTime);
  const end = timeToMinutes(seatEndTime);
  if (start >= end) {
    return 'Seat end time must be after its start time.';
  }

  const openingHours = await getOpeningHours();
  for (const day of seatDays) {
    const hours = openingHours.find((entry) => entry.day === day);
    if (!hours || hours.isClosed) {
      return `${day} is not an open library day.`;
    }
    if (
      !validTime.test(hours.open) ||
      !validTime.test(hours.close) ||
      start < timeToMinutes(hours.open) ||
      end > timeToMinutes(hours.close)
    ) {
      return `The selected time must fit within ${day}'s opening hours (${hours.open}–${hours.close}).`;
    }
  }
  return null;
};

const getSeatNumber = (seatNumber: string): number | null => {
  const match = seatNumber.match(/\d+/);
  if (!match) return null;
  const value = Number(match[0]);
  return value >= 1 && value <= 64 ? value : null;
};

export const normalizeSeatNumber = (seatNumber: string): string | null => {
  const normalized = getSeatNumber(seatNumber);
  return normalized === null ? null : String(normalized);
};

export const findSeatScheduleConflict = async (
  seatNumber: string,
  schedule: SeatSchedule,
  excludeStudentId?: string
): Promise<string | null> => {
  const targetSeat = getSeatNumber(seatNumber);
  if (!targetSeat) return 'Choose a valid seat from 1 to 64.';

  const assignedStudents = await Student.find({
    status: 'active',
    registrationStatus: 'approved',
    seatNumber: { $exists: true, $ne: '' },
    ...(excludeStudentId ? { _id: { $ne: excludeStudentId } } : {}),
  }).select('_id name seatNumber seatDays seatStartTime seatEndTime').lean();

  for (const student of assignedStudents) {
    if (!student.seatNumber || getSeatNumber(student.seatNumber) !== targetSeat) continue;

    if (seatSchedulesOverlap(schedule, {
      seatDays: student.seatDays || [],
      seatStartTime: student.seatStartTime || '',
      seatEndTime: student.seatEndTime || '',
    })) {
      return `Seat ${targetSeat} is already assigned to ${student.name} during an overlapping time on a selected day.`;
    }
  }
  return null;
};
