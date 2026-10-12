export declare const WEEK_DAYS: readonly ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
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
export declare const seatSchedulesOverlap: (first: SeatSchedule, second: SeatSchedule) => boolean;
export declare const getOpeningHours: () => Promise<OpeningHours[]>;
export declare const validateSeatSchedule: (schedule: SeatSchedule) => Promise<string | null>;
export declare const normalizeSeatNumber: (seatNumber: string) => string | null;
export declare const findSeatScheduleConflict: (seatNumber: string, schedule: SeatSchedule, excludeStudentId?: string) => Promise<string | null>;
export {};
//# sourceMappingURL=seatSchedule.d.ts.map