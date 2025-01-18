import { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { TokenInfoProvider } from "../providers/tokenInfoProvider.ts";

export const pairInfoTemplate = `Determine if this is a pair information request. If it is one of the specified situations, perform the corresponding action:

Situation 1: "Get pair information"
- Message contains: words like "info", "symbol", "pair", "information" AND a token symbol/address
- Example: "What's the information of usdt and weth pair"
- Action: Get the current information of the pair

Previous conversation for context:
{{conversation}}

You are replying to: {{message}}
`;

export class getPairInfoAction implements Action {
    name = "GET_PAIR_INFO";
    similes = ["FETCH_PAIR_INFO", "CHECK_PAIR_INFO", "PAIR_INFO"];
    description = "Fetches and returns pair information";
    suppressInitialMessage = true;
    template = pairInfoTemplate;

    async validate(runtime: IAgentRuntime, message: Memory): Promise<boolean> {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text;

        if (!content) return false;

        const hasPairKeyword = /\b(info|information|symbol|pair)\b/i.test(content);
        const hasToken = (
            /0x[a-fA-F0-9]{40}/.test(content) ||
            /[$#]?[a-zA-Z0-9]+/i.test(content)
        );

        return hasPairKeyword && hasToken;
    }

    async handler(
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        _options: { [key: string]: unknown } = {},
        callback?: HandlerCallback
    ): Promise<boolean> {
        try {
            // Get the provider
            const provider = runtime.providers.find(p => p instanceof TokenInfoProvider);
            if (!provider) {
                throw new Error("Token Info provider not found");
            }

            // Get price data
            console.log("Fetching pair info data...");
            const infoData = await provider.get(runtime, message, state);
            console.log("Received pair info data:", infoData);

            if (infoData.includes("Error")) {
                throw new Error(infoData);
            }

            // If we have a callback, use it to send the response
            if (callback) {
                await callback({
                    text: infoData,
                    action: this.name
                });
            }

            // Set the response in state to prevent further processing
            if (state) {
                state.responseData = {
                    text: infoData,
                    action: this.name
                };
            }

            return true;

        } catch (error) {
            console.error("Error in getting the pair Info action handler:", error);

            if (callback) {
                await callback({
                    text: `Sorry, I couldn't fetch the pair Info: ${error.message}`,
                    action: this.name
                });
            }

            return false;
        }
    }

    examples = [
        [
            {
                user: "{{user}}",
                content: {
                    text: "What's the Info of USDT and WETH pair?"
                }
            },
            {
                user: "{{system}}",
                content: {
                    text: "Pair: 0xcBa131EBE81f5514Da77D81e028cadb7211F766a [ USDT:0xaD73CbeE67Cb402488072d2444D58441b607Ec8F - WETH:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2]",
                    action: "GET_PAIR_INFO"
                }
            }
        ],
        [
            {
                user: "{{user}}",
                content: {
                    text: "Show me the pair info: usdt and weth"
                }
            },
            {
                user: "{{system}}",
                content: {
                    text: "Pair: 0xcBa131EBE81f5514Da77D81e028cadb7211F766a [ USDT: 0xaD73CbeE67Cb402488072d2444D58441b607Ec8F - WETH, 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2]",
                    action: "GET_PAIR_INFO"
                }
            }
        ],
    ];
}