import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@elizaos/core";

import { ChainId, CurrencyAmount, Token, WETH9 } from '@uniswap/sdk-core'
import { Route } from '@uniswap/v2-sdk'
import { Pair } from '@uniswap/v2-sdk'
import { ethers } from "ethers";
import uniswapV2poolABI from "../abi/uniswapV2poolABI.json";
import IERC20ABI from "../abi/IERC20.json";

const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18)
const ALCHEMY_MAINNET_URL = 'https://rpc.ankr.com/eth';
const provider = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)

async function getDecimals(tokenAddress: string): Promise<number> {

    const tokenContract = new ethers.Contract(tokenAddress, IERC20ABI, provider);
    const decimal: ethers.BigNumberish = await tokenContract.decimals();

    return Number(decimal.toString())
}

async function getSymbol(tokenAddress: string): Promise<string> {
    const tokenContract = new ethers.Contract(tokenAddress, IERC20ABI, provider);
    const symbol: string = await tokenContract.symbol();

    return symbol
}

async function createPair(tokenAddress: string): Promise<Pair> {
    const tokenDecimal = await getDecimals(tokenAddress)

    const token = new Token(ChainId.MAINNET, tokenAddress, tokenDecimal)

    const pairAddress = Pair.getAddress(DAI, token)

    // Setup provider, import necessary ABI ...
    const pairContract = new ethers.Contract(pairAddress, uniswapV2poolABI, provider)
    const reserves = await pairContract["getReserves"]()
    const [reserve0, reserve1] = reserves

    const tokens = [DAI, token]
    const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]]

    // Ensure reserve0 and reserve1 are BigNumbers
    const reserve0BN = ethers.toBigInt(reserve0.toString())
    const reserve1BN = ethers.toBigInt(reserve1.toString())

    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, reserve0BN.toString()),
      CurrencyAmount.fromRawAmount(token1, reserve1BN.toString())
    )
    return pair
}

function extractToken(content: string): string | null {
    // Try different patterns in order of specificity
    const patterns = [
        /0x[a-fA-F0-9]{40}/, // ETH address
        /[$#]([a-zA-Z0-9]+)/, // $TOKEN or #TOKEN
        /(?:price|value|worth|cost)\s+(?:of|for)\s+([a-zA-Z0-9]+)/i, // "price of TOKEN"
        /\b(?:of|for)\s+([a-zA-Z0-9]+)\b/i, // "of TOKEN"
    ];

    for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
            // Use captured group if it exists, otherwise use full match
            const token = match[1] || match[0];
            // Clean up the token identifier
            return token.replace(/[$#]/g, "").toLowerCase().trim();
        }
    }

    return null;
}

export const getPriceAction: Action = {
    name: "GET_PRICE",
    similes: ["PRICE", "price"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    description: "get the token price",
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _option: {[key: string]: unknown},
        callback?: HandlerCallback
    ): Promise<boolean> => {

        const content =
        typeof _message.content === "string"
            ? _message.content
            : _message.content?.text;

        const tokenIdentifier = extractToken(content);

        // To learn how to get Pair data, refer to the previous guide.
        const pair = await createPair(tokenIdentifier)

        let tokenDecimal = await getDecimals(tokenIdentifier)

        const token = new Token(ChainId.MAINNET, tokenIdentifier, tokenDecimal)

        const route = new Route([pair], token, DAI)

        if (callback) {
            await callback({
                text: `${await getSymbol(token.address)}: ${route.midPrice.toSignificant(6)}`,
                action: "GET_PRICE"
            });
        }

        // Set the response in state to prevent further processing
        if (_state) {
            _state.responseData = {
                text: `${await getSymbol(token.address)}: ${route.midPrice.toSignificant(6)}`,
                action: "GET_PRICE"
            };
        }
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "please show me the price of 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
            },
            {
                user: "{{system}}",
                content: { text: "the price is ...", action: "GET_PRICE", },
            },
        ],
    ] as ActionExample[][],
} as Action;
