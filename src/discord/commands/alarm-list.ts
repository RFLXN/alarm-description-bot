import {
    type ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder
} from "discord.js";
import type { Command } from "@/discord/types";
import logger from "@/logger";
import { getGuildSchedules } from "@/scheduler/store";
import type { Schedule } from "@/scheduler/types";

async function doServerOnly(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
        content: "This command can only be used in a server",
        ephemeral: true
    });
    logger.warn(`Command alarm list not used in a server by ${interaction.user.tag}`);
}

function createScheduleListEmbed(schedules: Schedule[]) {
    return new EmbedBuilder()
        .setTitle("Alarm list")
        .setDescription(
            schedules.length > 0
                ? schedules.map(
                    schedule =>
                        `* [${schedule.id}] ${schedule.cron.replaceAll("*", "\\*")} -> <#${schedule.channelId}> by <@${schedule.creatorId}>`)
                    .join("\n")
                : "None"
        );
}

const alarmListCommand: Command = {
    exec: async (interaction) => {
        if (!interaction.inGuild()) return doServerOnly(interaction);

        const schedules = getGuildSchedules(interaction.guild!.id);

        await interaction.reply({
            embeds: [createScheduleListEmbed(schedules)],
            ephemeral: true
        });
    },
    data: new SlashCommandBuilder()
        .setName("alarm")
        .setDescription("List the alarms of this server")
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName("list")
                .setDescription("List the alarms of this server")
        )
};

export default alarmListCommand;
