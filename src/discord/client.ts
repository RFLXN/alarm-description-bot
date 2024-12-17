import { err, ok, type Result } from "neverthrow";
import { Client, IntentsBitField } from "discord.js";
import { ClientNotInitializedError } from "@/discord/errors";
import commands from "@/discord/commands";
import logger from "@/logger";
import buttonHandlers from "@/discord/buttons";

let client: Client<true> | null = null;

export function getClient(): Result<Client<true>, ClientNotInitializedError> {
    if (!client) return err(new ClientNotInitializedError());
    return ok(client);
}

export async function initClient(token: string): Promise<Result<Client<true>, Error>> {
    const initializedClient = new Client({ intents: [IntentsBitField.Flags.Guilds] });

    try {
        await initializedClient.login(token);
    } catch (e) {
        return err(e as Error);
    }

    client = initializedClient as Client<true>;

    client.on("interactionCreate", (interaction) => {
        if (interaction.isChatInputCommand()) {
            const commandName = interaction.commandName;
            commands.get(commandName)
                ?.exec(interaction)
                ?.then(() => logger.info(`Command executed: ${commandName}, User ${interaction.user.id}`))
                ?.catch(e => logger.error(e));
        } else if (interaction.isButton()) {
            const prefix = interaction.customId.split(":")[0];
            buttonHandlers.get(prefix)
                ?.exec(interaction)
                ?.then(() => logger.info(`Button handled: ${prefix}, User ${interaction.user.id}`))
                ?.catch(e => logger.error(e));
        }
    });

    return ok(client);
}
