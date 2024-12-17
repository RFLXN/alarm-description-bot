import type { ButtonHandler } from "@/discord/types";
import subscribeHandler from "@/discord/buttons/subscribe";
import unsubscribeHandler from "@/discord/buttons/unsubscribe";

const index: ButtonHandler[] = [
    subscribeHandler,
    unsubscribeHandler
];

const buttonHandlers = new Map<string, ButtonHandler>();

index.map((handler) => {
    buttonHandlers.set(handler.prefix, handler);
});

export default buttonHandlers;
