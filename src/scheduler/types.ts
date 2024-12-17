import type { Job } from "node-schedule";

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
    worker?: Job;
}
