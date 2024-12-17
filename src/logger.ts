import pino, { transport } from "pino";

const transports = [
    {
        target: "pino-pretty",
        options: { destination: 1 }
    }
];

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const logger = pino(transport({ targets: transports }));

export default logger;
