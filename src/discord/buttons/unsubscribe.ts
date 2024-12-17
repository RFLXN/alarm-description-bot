import type { ButtonHandler } from "@/discord/types";
import type { ButtonInteraction } from "discord.js";
import logger from "@/logger";
import { getScheduleById, unsubscribeSchedule } from "@/scheduler/store";
import { NotSubscribedError } from "@/scheduler/errors";

async function doInvalidSchedule(interaction: ButtonInteraction, scheduleId: number) {
    await interaction.reply({
        content: "Error: Invalid alarm",
        ephemeral: true
    });
    logger.warn(`Unsubscribe button handled with invalid schedule ID: ${scheduleId}`);
}

async function doNotSubscribed(interaction: ButtonInteraction, scheduleId: number) {
    await interaction.reply({
        content: "Error: You are not subscribed to this alarm",
        ephemeral: true
    });
    logger.warn(`Unsubscribe button handled with not subscribed schedule ID: ${scheduleId}, User ${interaction.user.id}`);
}

async function doUnknownError<E extends Error>(interaction: ButtonInteraction, scheduleId: number, error: E) {
    await interaction.reply({
        content: "Error: Unknown error occurred",
        ephemeral: true
    });
    logger.error(`Unknown error occurred while handling unsubscribe button for schedule ID: ${scheduleId}, User ${interaction.user.id}`);
    logger.error(error);
}

async function doSuccess(interaction: ButtonInteraction, scheduleId: number) {
    await interaction.reply({
        content: `You have unsubscribed from this alarm (ID: ${scheduleId})`,
        ephemeral: true
    });
    logger.info(`User ${interaction.user.id} unsubscribed from schedule ID: ${scheduleId}`);
}

const unsubscribeHandler: ButtonHandler = {
    prefix: "unsubscribe",
    exec: async (interaction) => {
        const scheduleId = Number(interaction.customId.split(":")[1]);
        if (isNaN(scheduleId)) return doInvalidSchedule(interaction, scheduleId);

        const schedule = getScheduleById(scheduleId);
        if (!schedule) return doInvalidSchedule(interaction, scheduleId);

        const result = unsubscribeSchedule(scheduleId, interaction.user.id);
        if (result.isErr()) {
            if (result.error instanceof NotSubscribedError) return doNotSubscribed(interaction, scheduleId);
            return doUnknownError(interaction, scheduleId, result.error);
        }

        return doSuccess(interaction, scheduleId);
    }
};

export default unsubscribeHandler;
