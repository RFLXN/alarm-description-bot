import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { Schedule } from "@/scheduler/types";

export function createMessageContents(schedule: Schedule) {
    return `### [ALARM ${schedule.id}]\n`
        + `${schedule.message}`;
}

export function createMessageContentsWithMention(schedule: Schedule) {
    return createMessageContents(schedule) + "\n"
        + schedule.subscribers.map(subscriber => `<@${subscriber}>`).join(" ");
}

export function createSubscribeButton(id: number) {
    const subscribeButton = new ButtonBuilder()
        .setLabel("Subscribe")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`subscribe:${id}`);
    const unsubscribeButton = new ButtonBuilder()
        .setLabel("Unsubscribe")
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`unsubscribe:${id}`);
    return new ActionRowBuilder<ButtonBuilder>().addComponents(subscribeButton, unsubscribeButton);
}
