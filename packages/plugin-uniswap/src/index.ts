import { Plugin } from "@elizaos/core";
import { getChainIDAction } from "./actions/getChianID.ts";
import { getPriceAction } from "./actions/getPrice.ts";
// import { factEvaluator } from "./evaluators/fact.ts";
// import { timeProvider } from "./providers/time.ts";

export * as actions from "./actions/index.ts";
export * as evaluators from "./evaluators/index.ts";
export * as providers from "./providers/index.ts";

export const uniswapPlugin: Plugin = {
    name: "uniswap",
    description: "This is the demo of uniswap plugin",
    actions: [getChainIDAction, getPriceAction],
    // evaluators: [factEvaluator],
    // providers: [timeProvider],
};

// export default bootstrapPlugin;
