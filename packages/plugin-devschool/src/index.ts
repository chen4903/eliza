import { Plugin } from "@elizaos/core";
import { helloWorldAction } from "./actions/helloworld.ts";
// import { factEvaluator } from "./evaluators/fact.ts";
// import { timeProvider } from "./providers/time.ts";

export * as actions from "./actions";
export * as evaluators from "./evaluators";
export * as providers from "./providers";

export const devSchoolPlugin: Plugin = {
    name: "devschool",
    description: "Dev school example plugin",
    actions: [helloWorldAction],
    // evaluators: [factEvaluator],
    // providers: [timeProvider],
};

// export default bootstrapPlugin;
