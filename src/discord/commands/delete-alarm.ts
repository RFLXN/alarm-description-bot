import {
    type ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import type { Command } from "@/discord/types";
import { getScheduleById, removeSchedule } from "@/scheduler/store";
import logger from "@/logger";
import type { Schedule } from "@/scheduler/types";

async function doServerOnly(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        content: "This command can only be used in a server",
        ephemeral: true
    });
    logger.warn(`Command alarm list not used in a server by ${interaction.user.tag}`);
}

async function doInvalidSchedule(interaction: ChatInputCommandInteraction, id: number) {
    await interaction.reply({
        content: `Error: ${id} alarm does not exist`,
        ephemeral: true
    });
    logger.warn(`delete alarm command failed by ${interaction.user.id} because ${id} schedule does not exist`);
}

async function doNotAuthorized(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        content: "Alarm can only be deleted by the creator or an administrator",
        ephemeral: true
    });
    logger.warn(`delete alarm command failed by ${interaction.user.id} because of unauthorized`);
}

async function doUnknownError<E extends Error>(interaction: ChatInputCommandInteraction, error: E) {
    await interaction.reply({
        content: "Error: Unknown error occurred",
        ephemeral: true
    });
    logger.error(`Unknown error occurred while handling new alarm command by user ${interaction.user.id}`);
    logger.error(error);
}

async function doSuccess(interaction: ChatInputCommandInteraction, schedule: Schedule) {
    await interaction.reply({
        content: `Alarm ${schedule.id} is deleted from <#${schedule.channelId}>`
    });
    logger.info(`Alarm ${schedule.id} deleted by ${interaction.user.id}`);
}

const deleteAlarmCommand: Command = {
    exec: async (interaction) => {
        if (!interaction.inGuild()) return doServerOnly(interaction);

        const alarmId = interaction.options.getInteger("id", true);
        const schedule = getScheduleById(alarmId);
        if (!schedule) return doInvalidSchedule(interaction, alarmId);

        if (!(interaction.member.permissions as PermissionsBitField).has("Administrator")
            && schedule.creatorId !== interaction.user.id) return doNotAuthorized(interaction);

        const result = removeSchedule(alarmId);
        if (result.isErr()) return doUnknownError(interaction, result.error);

        return doSuccess(interaction, schedule);
    },
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Delete the alarm")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("alarm")
                .setDescription("Delete the alarm")
                .addIntegerOption(
                    new SlashCommandIntegerOption()
                        .setName("id")
                        .setDescription("The ID of the alarm")
                        .setRequired(true)
                )
        )
};

export default deleteAlarmCommand;
