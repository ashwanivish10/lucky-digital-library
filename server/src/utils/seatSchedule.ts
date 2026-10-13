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
  { day: 'Monday', open: '00:00', close: '23:59', isClosed: false },
  { day: 'Tuesday', open: '00:00', close: '23:59', isClosed: false },
  { day: 'Wednesday', open: '00:00', close: '23:59', isClosed: false },
  { day: 'Thursday', open: '00:00', close: '23:59', isClosed: false },
  { day: 'Friday', open: '00:00', close: '23:59', isClosed: false },
  { day: 'Saturday', open: '00:00', close: '23:59', isClosed: false },
  { day: 'Sunday', open: '00:00', close: '23:59', isClosed: false },
];

const timeToMinutes = (time: string, isEndTime = false): number => {
  if (!time) return isEndTime ? 24 * 60 : 0;
  if (isEndTime && (time === '00:00' || time === '24:00')) return 24 * 60;
  const [hours, minutes] = time.split(':').map(Number);
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
};

export const seatSchedulesOverlap = (
  first: SeatSchedule,
  second: SeatSchedule
): boolean => {
  const firstDays = first.seatDays?.length ? first.seatDays : [...WEEK_DAYS];
  const secondDays = second.seatDays?.length ? second.seatDays : [...WEEK_DAYS];
  if (!firstDays.some((day) => secondDays.includes(day))) return false;

  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
  const firstHasTime = validTime.test(first.seatStartTime) && (validTime.test(first.seatEndTime) || first.seatEndTime === '24:00');
  const secondHasTime = validTime.test(second.seatStartTime) && (validTime.test(second.seatEndTime) || second.seatEndTime === '24:00');

  const firstStart = firstHasTime ? timeToMinutes(first.seatStartTime) : 0;
  const firstEnd = firstHasTime ? timeToMinutes(first.seatEndTime, true) : 24 * 60;
  const secondStart = secondHasTime ? timeToMinutes(second.seatStartTime) : 0;
  const secondEnd = secondHasTime ? timeToMinutes(second.seatEndTime, true) : 24 * 60;

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
  const days = Array.isArray(seatDays) && seatDays.length > 0 ? seatDays : [...WEEK_DAYS];

  if (new Set(days).size !== days.length || days.some((day) => !WEEK_DAYS.includes(day as typeof WEEK_DAYS[number]))) {
    return 'The selected seat schedule contains an invalid day.';
  }

  // If both start and end time are omitted, it represents full-day 24h occupancy
  if (!seatStartTime && !seatEndTime) {
    return null;
  }

  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
  const isStartValid = validTime.test(seatStartTime);
  const isEndValid = validTime.test(seatEndTime) || seatEndTime === '24:00';

  if (!isStartValid || !isEndValid) {
    return 'Enter a valid seat start and end time.';
  }

  const start = timeToMinutes(seatStartTime);
  const end = timeToMinutes(seatEndTime, true);
  if (start >= end) {
    return 'Seat end time must be after its start time.';
  }

  const openingHours = await getOpeningHours();
  for (const day of days) {
    const hours = openingHours.find((entry) => entry.day === day);
    if (hours && hours.isClosed) {
      return `${day} is currently marked as closed.`;
    }
  }
  return null;
};

const getSeatNumber = (seatNumber: string): number | null => {
  const match = seatNumber.match(/\d+/);
  if (!match) return null;
  const value = Number(match[0]);
  return value >= 1 && value <= 58 ? value : null;
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
  if (!targetSeat) return 'Choose a valid seat from 1 to 58.';

  const assignedStudents = await Student.find({
    status: 'active',
    registrationStatus: 'approved',
    seatNumber: { $exists: true, $ne: '' },
    ...(excludeStudentId ? { _id: { $ne: excludeStudentId } } : {}),
  }).select('_id name seatNumber seatDays seatStartTime seatEndTime shiftTimings').lean();

  for (const student of assignedStudents) {
    if (!student.seatNumber || getSeatNumber(student.seatNumber) !== targetSeat) continue;

    if (seatSchedulesOverlap(schedule, {
      seatDays: student.seatDays || [],
      seatStartTime: student.seatStartTime || '',
      seatEndTime: student.seatEndTime || '',
    })) {
      const shiftDesc = student.shiftTimings || (student.seatStartTime && student.seatEndTime ? `${student.seatStartTime} to ${student.seatEndTime}` : 'Full Day');
      return `Seat ${targetSeat} is already assigned to ${student.name} (${shiftDesc}) during an overlapping time.`;
    }
  }
  return null;
};
