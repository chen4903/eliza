import { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";

// To obtain the information we need through third-party services, we use Dexscreener as a demonstration
// Function: I want to get the token address by its Symbol. For example: I type: please give me the USDT address,
//           then I could get USDT' address. However, it should be noted that this may not be accurate as there are a
//           large number of tokens with the same symbol present
export class TokenInfoProvider implements Provider {
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

            // Extract token from content
            const tokenIdentifier = this.extractToken(content);
            if (!tokenIdentifier) {
                throw new Error("Could not identify token in message");
            }

            // Make API request
            const isAddress = /^0x[a-fA-F0-9]{40}$/.test(tokenIdentifier)

            const endpoint = isAddress
                ? `https://api.dexscreener.com/latest/dex/tokens/${tokenIdentifier}`
                : `https://api.dexscreener.com/latest/dex/search?q=${tokenIdentifier}`;

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            // We get the data in Ethereum, for the demo
            const ethereumPair = data.pairs.find(pair => pair.chainId === 'ethereum');

            if (ethereumPair) {
                const pairAddress = ethereumPair.pairAddress;
                const baseTokenAddress = ethereumPair.baseToken.address;
                const baseTokenSymbol = ethereumPair.baseToken.symbol;
                const quoteTokenAddress = ethereumPair.quoteToken.address;
                const quoteTokenSymbol = ethereumPair.quoteToken.symbol;

                return `Pair: https://etherscan.io/address/${pairAddress} [ ${baseTokenSymbol}:${baseTokenAddress} - ${quoteTokenSymbol}:${quoteTokenAddress} ]`
            } else {
                console.log('No ethereum pair found');
                return `Error: No ethereum pair found`;
            }

        } catch (error) {
            console.error("TokenInfoProvider error:", error);
            return `Error: ${error.message}`;
        }
    }

    private extractToken(content: string): string | null {
        // Try different patterns in order of specificity
        const patterns = [
            /0x[a-fA-F0-9]{40}/, // ETH address
            /[$#]([a-zA-Z0-9]+)/, // $TOKEN or #TOKEN
            /(?:info|pair|information|symbol)\s+(?:of|for)\s+([a-zA-Z0-9]+)/i, // "info of TOKEN"
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

}
