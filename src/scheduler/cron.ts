const cronExpression = /^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/;

export default function isCronExpression(cron: string) {
    return cronExpression.test(cron);
}
