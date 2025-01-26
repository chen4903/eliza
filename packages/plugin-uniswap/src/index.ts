import { Plugin } from "@elizaos/core";
import { getChainIDAction } from "./actions/getChianID.ts";
import { getPriceAction } from "./actions/getPrice.ts";
import { getPairInfoAction } from "./actions/getPairInfo.ts";
import { TokenInfoProvider } from "./providers/tokenInfoProvider.ts";
import { TokenInfoEvaluator } from "./evaluators/tokenInfoExaluator.ts";
import { swapTokenAction } from "./actions/swap.ts";
import { SwapProvider } from "./providers/swapProvider.ts";
// import { factEvaluator } from "./evaluators/fact.ts";
// import { timeProvider } from "./providers/time.ts";

export * as actions from "./actions/index.ts";
export * as evaluators from "./evaluators/index.ts";
export * as providers from "./providers/index.ts";

// Eliza's Minimization Demo on Token and Uniswap
export const uniswapPlugin: Plugin = {
    name: "uniswap",
    description: "This is the demo of uniswap plugin",
    actions: [getChainIDAction, getPriceAction, new getPairInfoAction(), new swapTokenAction()],
    evaluators: [new TokenInfoEvaluator()],
    providers: [new TokenInfoProvider(), new SwapProvider()],
};

// export default bootstrapPlugin;
