import { Action, IAgentRuntime, Memory, State, HandlerCallback } from "@elizaos/core";
import { SwapProvider } from "../providers/swapProvider.ts";
import { ethers } from "ethers";
import UniswapV2RouterABI from "../abi/uniswapV2Router.json";

export const swapTemplate = `Determine if this is a token swap request. If it is one of the specified situations, perform the corresponding action:

Situation 1: "Swap the token"
- Message contains: words like "swap", "Swap"
- Example: "swap token0 to token1, amount: 100"
- Action: swap token

Previous conversation for context:
{{conversation}}

You are replying to: {{message}}
`;

const ALCHEMY_MAINNET_URL = 'https://binance.llamarpc.com';
const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)

const privateKey = process.env.EVM_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

export class swapTokenAction implements Action {
    name = "SWAP_TOKEN";
    similes = ["SWAP_TOKEN", "SWAP"];
    description = "Swap the token in DEX";
    suppressInitialMessage = true;
    template = swapTemplate;

    async validate(runtime: IAgentRuntime, message: Memory): Promise<boolean> {
        const content = typeof message.content === 'string'
            ? message.content
            : message.content?.text;

        if (!content) return false;

        const hasPairKeyword = /\b(swap|amount)\b/i.test(content);
        const hasToken = (
            /0x[a-fA-F0-9]{40}/.test(content) ||
            /[$#]?[a-zA-Z0-9]+/i.test(content)
        );

        return hasPairKeyword && hasToken;
    }

    private async swap(token0Address: string, token1Address: string, amount: number): Promise<string> {
        try {
            // pancake V2 router address
            const router = new ethers.Contract("0x10ed43c718714eb63d5aa57b78b54704e256024e", UniswapV2RouterABI, wallet);
            const tx = await router.swapExactETHForTokens(
                0,
                // [weth, token1]
                ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', token1Address],
                wallet.address,
                99999999999,
                {
                    value: amount,
                    gasLimit: 200000,
                }
            );

            console.log('Transaction hash:', tx.hash);

            const receipt = await tx.wait();
            console.log('Transaction receipt:', receipt);

            return tx.hash
        } catch (error) {
            return "ERROR: swap";
        }
    }

    private parseSwapString(input: string): { token1: string; token2: string; amount: number } {
        const regex = /swap (0x[a-fA-F0-9]{40}) to (0x[a-fA-F0-9]{40}), amount: (\d+)/;

        const match = input.match(regex);

        if (match) {
            const token1 = match[1];
            const token2 = match[2];
            const amount = parseInt(match[3], 10);
            return { token1, token2, amount };
        } else {
            throw new Error('Invalid input string');
        }
    }
    // // demo
    // const input = 'swap 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 to 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984, amount: 100';
    // const result = parseSwapString(input);
    // console.log(result); // Output：{ token1: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', token2: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', amount: 100 }


    async handler(
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        _options: { [key: string]: unknown } = {},
        _callback?: HandlerCallback
    ): Promise<boolean> {
        try {
            const content =
            typeof message.content === "string"
                ? message.content
                : message.content?.text;

            const result2 = this.parseSwapString(content);

            const hash = await this.swap(result2.token1, result2.token2, result2.amount);

            _callback({text: `Hash: ${hash}`});

            return true;

        } catch (error) {
            return false;
        }
    }

    examples = [
        [
            {
                user: "{{user}}",
                content: {
                    text: "swap 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE to 0x55d398326f99059ff775485246999027b3197955, amount: 100000000000000"
                }
            },
            {
                user: "{{system}}",
                content: {
                    text: "Hash: 0x0bbaeed59049ae2b453733d788f1a396b3a5c7dc8d70e5584329539678c21147",
                    action: "SWAP_TOKEN"
                }
            }
        ],
    ];
}