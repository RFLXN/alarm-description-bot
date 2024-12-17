import type { Command } from "@/discord/types";
import newAlarmCommand from "@/discord/commands/new-alarm";
import deleteAlarmCommand from "@/discord/commands/delete-alarm";
import alarmListCommand from "@/discord/commands/alarm-list";

const index: Command[] = [
    newAlarmCommand,
    deleteAlarmCommand,
    alarmListCommand
];

const commands = new Map<string, Command>();

index.map((command) => {
    commands.set(command.data.name!, command);
});

export default commands;
