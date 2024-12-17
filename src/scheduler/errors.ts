export class InvalidCronExpressionError extends Error {
    constructor(cron: string) {
        super(`Invalid cron expression: ${cron}`);
    }
}

export class InvalidScheduleError extends Error {
    constructor() {
        super("Invalid schedule");
    }
}

export class AlreadySubscribedError extends Error {
    constructor() {
        super("Already subscribed");
    }
}

export class NotSubscribedError extends Error {
    constructor() {
        super("Not subscribed");
    }
}
