import {
    ChannelType,
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder
} from "discord.js";
import type { Command } from "@/discord/types";
import { addSchedule } from "@/scheduler/store";
import { InvalidCronExpressionError } from "@/scheduler/errors";
import logger from "@/logger";

async function doInvalidChannelTypeError(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        content: "Error: Invalid channel type",
        ephemeral: true
    });
    logger.warn(`new alarm command handled with invalid channel type by user ${interaction.user.id}`);
}

async function doInvalidCronExpressionError(interaction: ChatInputCommandInteraction, cron: string) {
    await interaction.reply({
        content: `Error: Invalid cron express: '${cron}'`,
        ephemeral: true
    });
    logger.warn(`new alarm command handled with invalid cron expression: ${cron} by user ${interaction.user.id}`);
}

async function doUnknownError<E extends Error>(interaction: ChatInputCommandInteraction, error: E) {
    await interaction.reply({
        content: "Error: Unknown error occurred",
        ephemeral: true
    });
    logger.error(`Unknown error occurred while handling new alarm command by user ${interaction.user.id}`);
    logger.error(error);
}

async function doSuccess(interaction: ChatInputCommandInteraction, scheduleId: number) {
    await interaction.reply({
        content: `Alarm created with ID: ${scheduleId}`
    });
    logger.info(`User ${interaction.user.id} created alarm with ID: ${scheduleId}`);
}

const newAlarmCommand: Command = {
    exec: async (interaction) => {
        const channel = interaction.options.getChannel("target_channel", true);
        const cron = interaction.options.getString("cron", true);
        const message = interaction.options.getString("message", true);

        if (!interaction.inGuild()) return doInvalidChannelTypeError(interaction);

        switch (channel.type) {
            case ChannelType.GuildText:
            case ChannelType.PublicThread:
            case ChannelType.PrivateThread:
                break;
            default:
                return doInvalidChannelTypeError(interaction);
        }

        const result = addSchedule({
            guildId: interaction.guild!.id,
            channelId: channel.id,
            creatorId: interaction.user.id,
            cron,
            message
        });

        if (result.isErr()) {
            if (result.error instanceof InvalidCronExpressionError) return doInvalidCronExpressionError(interaction, cron);
            return doUnknownError(interaction, result.error);
        }

        return doSuccess(interaction, result.value.id);
    },
    data: new SlashCommandBuilder()
        .setName("new")
        .setDescription("Create a new cron-based alarm")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("alarm")
                .setDescription("Create a new cron-based alarm")
                .addChannelOption(
                    new SlashCommandChannelOption()
                        .setName("target_channel")
                        .setDescription("The channel to send the alarm")
                        .setRequired(true)
                        .addChannelTypes([ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread])
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("cron")
                        .setDescription("The cron expression for the alarm")
                        .setRequired(true)
                )
                .addStringOption(
                    new SlashCommandStringOption()
                        .setName("message")
                        .setDescription("The message to send")
                        .setRequired(true)
                )
        )
};

export default newAlarmCommand;
