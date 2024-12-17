export class ClientNotInitializedError extends Error {
    constructor() {
        super("Client not initialized");
    }
}
