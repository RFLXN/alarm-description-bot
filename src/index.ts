import process from "process";
import "@/env";
import logger from "@/logger";
import { initClient } from "@/discord/client";
import { Scheduler } from "@/scheduler";
import type { TextChannel } from "discord.js";
import { registerCommands } from "@/discord/register";
import commandIndex from "@/discord/commands";
import { restoreSchedules } from "@/scheduler/store";
import { createMessageContentsWithMention, createSubscribeButton } from "@/discord/message";

const token = process.env.DISCORD_TOKEN!;

void (async () => {
    logger.info("Discord client initializing...");
    const client = await initClient(token);
    if (client.isErr()) {
        logger.error(client.error);
        process.exit(1);
    }
    logger.info(`Discord client initialized with '@${client.value.user.username}'`);

    logger.info("Registering commands...");
    const commands = Array.from(commandIndex.values()).map(command => command.data);
    logger.info(`Found ${commands.length} commands: [${commands.map(command => command.name).join(", ")}]`);
    const register = await registerCommands(
        token,
        client.value.application.id,
        commands
    );
    if (register.isErr()) {
        logger.error(register.error);
        process.exit(1);
    }
    logger.info("Commands registered");

    logger.info("Restoring schedules from database...");
    const restore = await restoreSchedules();
    if (restore.isErr()) {
        logger.error(restore.error);
        process.exit(1);
    }
    logger.info("Schedules restored");

    Scheduler.instance.on("onSchedule", (schedule) => {
        logger.info(`Schedule triggered: Cron '${schedule.cron}', ID ${schedule.id}`);
        client.value.channels.fetch(schedule.channelId)
            .then((channel) => {
                if (channel?.isTextBased()) {
                    const message = createMessageContentsWithMention(schedule);
                    const buttons = createSubscribeButton(schedule.id);
                    (channel as TextChannel).send({
                        content: message,
                        components: [buttons]
                    })
                        .then(() => logger.info(`Message sent to channel ${schedule.channelId}: ${message}`))
                        .catch(e => logger.error(e));
                }
            })
            .catch(e => logger.error(e));
    });
})();
