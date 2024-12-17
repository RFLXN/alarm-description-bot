import { REST, Routes } from "discord.js";
import { err, ok, type Result } from "neverthrow";
import type { SlashCommandData } from "@/discord/types";

export async function registerCommands(
    token: string, applicationId: string, commands: SlashCommandData[]
): Promise<Result<null, Error>> {
    const rest = new REST();
    rest.setToken(token);

    try {
        await rest.put(Routes.applicationCommands(applicationId), {
            body: commands
        });
        return ok(null);
    } catch (e) {
        return err(e as Error);
    }
}
