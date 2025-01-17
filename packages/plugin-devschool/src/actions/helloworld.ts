import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@elizaos/core";

export const helloWorldAction: Action = {
    name: "HELLO_WORLD",
    similes: ["HELLO"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description:
        "Make a hello world",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _option: {[key: string]: unknown},
        _callback: HandlerCallback
    ): Promise<boolean> => {

        const helloWorldArt = `Successfully execute the hello world`;
        _callback({text: helloWorldArt});
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "can you say hello world" },
            },
            {
                user: "{{system}}",
                content: { text: "HELLO_WORLD 1", action: "HELLO_WORLD", },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "hello world" },
            },
            {
                user: "{{system}}",
                content: { text: "HELLO_WORLD 2" },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "execute the HELLO_WORLD action" },
            },
            {
                user: "{{system}}",
                content: {
                    text: "HELLO_WORLD 3",
                    action: "HELLO_WORLD"
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
