import type { ButtonHandler } from "@/discord/types";
import logger from "@/logger";
import type { ButtonInteraction } from "discord.js";
import { getScheduleById, subscribeSchedule } from "@/scheduler/store";
import { AlreadySubscribedError } from "@/scheduler/errors";

async function doInvalidSchedule(interaction: ButtonInteraction, scheduleId: number) {
    await interaction.reply({
        content: "Error: Invalid alarm",
        ephemeral: true
    });
    logger.warn(`Subscribe button handled with invalid schedule ID: ${scheduleId}`);
}

async function doAlreadySubscribed(interaction: ButtonInteraction, scheduleId: number) {
    await interaction.reply({
        content: "Error: Your are already subscribed to this alarm",
        ephemeral: true
    });
    logger.warn(`Subscribe button handled with already subscribed schedule ID: ${scheduleId}, User ${interaction.user.id}`);
}

async function doUnknownError<E extends Error>(interaction: ButtonInteraction, scheduleId: number, error: E) {
    await interaction.reply({
        content: "Error: Unknown error occurred",
        ephemeral: true
    });
    logger.error(`Unknown error occurred while handling subscribe button for schedule ID: ${scheduleId}, User ${interaction.user.id}`);
    logger.error(error);
}

async function doSuccess(interaction: ButtonInteraction, scheduleId: number) {
    await interaction.reply({
        content: `You have subscribed to this alarm (ID: ${scheduleId})`,
        ephemeral: true
    });
    logger.info(`User ${interaction.user.id} subscribed to schedule ID: ${scheduleId}`);
}

const subscribeHandler: ButtonHandler = {
    prefix: "subscribe",
    exec: async (interaction) => {
        const scheduleId = Number(interaction.customId.split(":")[1]);
        if (isNaN(scheduleId)) return doInvalidSchedule(interaction, scheduleId);

        const schedule = getScheduleById(scheduleId);
        if (!schedule) return doInvalidSchedule(interaction, scheduleId);

        const result = subscribeSchedule(scheduleId, interaction.user.id);
        if (result.isErr()) {
            if (result.error instanceof AlreadySubscribedError) return doAlreadySubscribed(interaction, scheduleId);
            return doUnknownError(interaction, scheduleId, result.error);
        }

        return doSuccess(interaction, scheduleId);
    }
};

export default subscribeHandler;
