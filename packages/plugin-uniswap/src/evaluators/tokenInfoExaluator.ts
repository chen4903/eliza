import { Evaluator, IAgentRuntime, Memory, State } from "@elizaos/core";

export class TokenInfoEvaluator implements Evaluator {
    name = "PAIR_INFO_EVALUATOR";
    similes = ["information", "pair info", "check info"];
    description = "Evaluates messages for pair information requests";

    async validate(runtime: IAgentRuntime, message: Memory): Promise<boolean> {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text;

        if (!content) return false;

        // Check for pair-information-related keywords
        const hasInfoKeyword = /\b(information|info|details|symbol)\b/i.test(content);

        // Look for either:
        // 1. Ethereum address
        // 2. Token symbol starting with $ or #
        // 3. Token symbol after "of" or "for" (case insensitive)
        const hasToken = (
            /0x[a-fA-F0-9]{40}/.test(content) || // Ethereum address
            /[$#][a-zA-Z]+/.test(content) || // $TOKEN or #TOKEN format
            /\b(of|for)\s+[a-zA-Z0-9]+\b/i.test(content) // "Info of TOKEN" format
        );

        return hasInfoKeyword && hasToken;
    }

    async handler(_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<string> {
        return "GET_PAIR_INFO";
    }

    examples = [
        {
            context: "User asking for pair information with address",
            messages: [
                {
                    user: "{{user}}",
                    content: {
                        text: "What's the Info of USDT and WETH pair?",
                        action: "GET_PAIR_INFO"
                    }
                }
            ],
            outcome: "GET_PAIR_INFO"
        },
        {
            context: "User checking token symbol",
            messages: [
                {
                    user: "{{user}}",
                    content: {
                        text: "Check symbol of 0x1234567890123456789012345678901234567890",
                        action: "GET_PAIR_INFO"
                    }
                }
            ],
            outcome: "GET_PAIR_INFO"
        },
        {
            context: "User checking token address with plain symbol",
            messages: [
                {
                    user: "{{user}}",
                    content: {
                        text: "What's the address for usdt",
                        action: "GET_PAIR_INFO"
                    }
                }
            ],
            outcome: "GET_PAIR_INFO"
        }
    ];
}