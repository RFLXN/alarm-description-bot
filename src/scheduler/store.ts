import { err, ok, type Result } from "neverthrow";
import type { Schedule, ScheduleOptions } from "@/scheduler/types";
import isCronExpression from "@/scheduler/cron";
import {
    AlreadySubscribedError,
    InvalidCronExpressionError,
    InvalidScheduleError,
    NotSubscribedError
} from "@/scheduler/errors";
import { scheduleJob } from "node-schedule";
import { Scheduler } from "@/scheduler/index";
import db from "@/db";
import logger from "@/logger";

const store = new Map<number, Schedule>();

function getNewId() {
    let id = 0;
    while (true) {
        id = Math.floor(Math.random() * 1000);
        if (!store.has(id)) return id;
    }
}

export function getScheduleById(id: number) {
    return store.get(id);
}

export function addSchedule(options: ScheduleOptions): Result<Schedule, InvalidCronExpressionError> {
    if (!isCronExpression(options.cron))
        return err(new InvalidCronExpressionError(options.cron));

    const id = getNewId();

    const worker = scheduleJob(options.cron, () => {
        const schedule = getScheduleById(id);
        if (schedule) {
            Scheduler.instance.emit("onSchedule", schedule);
        }
    });

    const schedule = {
        ...options,
        id,
        subscribers: [options.creatorId],
        worker
    };

    store.set(id, schedule);

    addScheduleToDb(schedule).catch(e => logger.error(e));

    return ok(schedule);
}

async function addScheduleToDb(schedule: Schedule) {
    await db.schedule.create({
        data: {
            id: schedule.id,
            creatorId: schedule.creatorId,
            channelId: schedule.channelId,
            guildId: schedule.guildId,
            message: schedule.message,
            cron: schedule.cron
        }
    });
    await db.subscriber.create({
        data: {
            userId: schedule.creatorId,
            scheduleId: schedule.id
        }
    });
}

export function removeSchedule(id: number): Result<ScheduleOptions, InvalidScheduleError> {
    const schedule = getScheduleById(id);
    if (!schedule) return err(new InvalidScheduleError());

    schedule.worker?.cancel();
    store.delete(id);

    removeScheduleFromDb(id).catch(e => logger.error(e));

    return ok({
        id: schedule.id,
        creatorId: schedule.creatorId,
        channelId: schedule.channelId,
        guildId: schedule.guildId,
        message: schedule.message,
        cron: schedule.cron
    });
}

async function removeScheduleFromDb(id: number) {
    await db.subscriber.deleteMany({
        where: {
            scheduleId: id
        }
    });
    await db.schedule.delete({
        where: {
            id
        }
    });
}

export function subscribeSchedule(scheduleId: number, userId: string) {
    const schedule = getScheduleById(scheduleId);
    if (!schedule) return err(new InvalidScheduleError());

    if (!schedule.subscribers.includes(userId)) {
        schedule.subscribers.push(userId);
        addSubscriberToDb(scheduleId, userId).catch(e => logger.error(e));
    } else {
        return err(new AlreadySubscribedError());
    }

    return ok(null);
}

async function addSubscriberToDb(scheduleId: number, userId: string) {
    try {
        await db.subscriber.create({
            data: {
                userId, scheduleId
            }
        });
    } catch (e) {
        return err(e as Error);
    }

    return ok(null);
}

export function unsubscribeSchedule(scheduleId: number, userId: string) {
    const schedule = getScheduleById(scheduleId);
    if (!schedule) return err(new InvalidScheduleError());

    const index = schedule.subscribers.indexOf(userId);
    if (index !== -1) {
        schedule.subscribers.splice(index, 1);
        removeSubscriberFromDb(scheduleId, userId).catch(e => logger.error(e));
    } else {
        return err(new NotSubscribedError());
    }

    return ok(null);
}

async function removeSubscriberFromDb(scheduleId: number, userId: string) {
    try {
        await db.subscriber.delete({
            where: {
                userId_scheduleId: {
                    scheduleId, userId
                }
            }
        });
    } catch (e) {
        return err(e as Error);
    }

    return ok(null);
}

export function getGuildSchedules(guildId: string) {
    return Array.from(store.values()).filter(schedule => schedule.guildId === guildId);
}

export async function restoreSchedules() {
    try {
        const schedules = await db.schedule.findMany({
            include: {
                subscribers: true
            }
        });

        schedules.map((schedule) => {
            const worker = scheduleJob(schedule.cron, () => {
                const s = getScheduleById(schedule.id);
                if (s) {
                    Scheduler.instance.emit("onSchedule", s);
                }
            });
            store.set(schedule.id, {
                id: schedule.id,
                creatorId: schedule.creatorId,
                channelId: schedule.channelId,
                guildId: schedule.guildId,
                message: schedule.message,
                cron: schedule.cron,
                worker: worker,
                subscribers: schedule.subscribers.map(s => s.userId)
            });
        });
    } catch (e) {
        return err(e as Error);
    }

    return ok(null);
}
