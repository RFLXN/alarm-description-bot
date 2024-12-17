import {
    ButtonInteraction,
    type ChatInputCommandInteraction,
    type SlashCommandBuilder,
    type SlashCommandOptionsOnlyBuilder,
    type SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

export type SlashCommandData = Partial<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder>;

export interface Command {
    exec: (interaction: ChatInputCommandInteraction) => Promise<void> | void;
    data: SlashCommandData;
}

export interface ButtonHandler {
    prefix: string;
    exec: (interaction: ButtonInteraction) => Promise<void> | void;
}
