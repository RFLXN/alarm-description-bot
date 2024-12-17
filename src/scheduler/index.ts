import EventEmitter from "events";
import type { default as TypedEmitter, EventMap } from "typed-emitter";

export interface ScheduleOptions {
    guildId: string;
    channelId: string;
    cron: string;
    creatorId: string;
    message: string;
}

export interface Schedule extends ScheduleOptions {
    id: number;
    subscribers: string[];
}

export interface SchedulerEvents extends EventMap {
    newSchedule: (options: ScheduleOptions) => void;
    onSchedule: (schedule: Schedule) => void;
}

export class Scheduler extends (EventEmitter as new () => TypedEmitter<SchedulerEvents>) {
    private static readonly i = new Scheduler();
    public static get instance() {
        return this.i;
    }

    private constructor() {
        super();
    }
}
