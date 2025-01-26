import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@elizaos/core";

// just use to show the usage of eliza framework
import { ChainId } from '@uniswap/sdk-core'

// hello world action
export const getChainIDAction: Action = {
    name: "GET_CHAIN_ID",
    similes: ["CHAIN_ID", "chain id", "id", "ID"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description: "Get the chain id of the current network",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _option: {[key: string]: unknown},
        callback?: HandlerCallback
    ): Promise<boolean> => {

        // We don't do a lot of things, just say have a demo

        if (callback) {
            await callback({
                text: `Current chain id is: ${ChainId.MAINNET.toString()}`,
                action: "GET_CHAIN_ID"
            });
        }

        // Set the response in state to prevent further processing
        if (_state) {
            _state.responseData = {
                text: `Current chain id is: ${ChainId.MAINNET.toString()}`,
                action: "GET_CHAIN_ID"
            };
        }
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "please show me the chain id" },
            },
            {
                user: "{{system}}",
                content: { text: "chain id is ...", action: "GET_CHAIN_ID", },
            },
        ],
    ] as ActionExample[][],
} as Action;
