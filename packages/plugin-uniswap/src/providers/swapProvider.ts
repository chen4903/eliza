import { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";

// This provider is not used in the demo. But in the production environment, we could use it to do some stuffs and get more data
export class SwapProvider implements Provider {
    async get(
        runtime: IAgentRuntime,
        message: Memory,
        _state?: State
    ): Promise<string> {
        try {
            const content =
                typeof message.content === "string"
                    ? message.content
                    : message.content?.text;

            if (!content) {
                throw new Error("No message content provided");
            }

            // Hey, we could get more data, some stuffs...

            return "True"
        } catch (error) {
            console.error("TokenInfoProvider error:", error);
            return `Error: ${error.message}`;
        }
    }
}
