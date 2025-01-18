import { Provider, IAgentRuntime, Memory, State } from "@elizaos/core";


export class SwapProvider implements Provider {
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

            return "True"

        } catch (error) {
            console.error("TokenInfoProvider error:", error);
            return `Error: ${error.message}`;
        }
    }


    private parseSwapString(input: string): { token1: string; token2: string; amount: number } {
        // 定义正则表达式，匹配两个16进制字符串和amount后面的数值
        const regex = /swap (0x[a-fA-F0-9]{40}) to (0x[a-fA-F0-9]{40}), amount: (\d+)/;

        // 使用正则表达式匹配输入字符串
        const match = input.match(regex);

        if (match) {
            // 如果匹配成功，提取两个16进制字符串和amount后面的数值
            const token1 = match[1];
            const token2 = match[2];
            const amount = parseInt(match[3], 10);

            // 返回结果对象
            return { token1, token2, amount };
        } else {
            // 如果匹配失败，抛出错误
            throw new Error('Invalid input string');
        }
    }
    // // 示例用法
    // const input = 'swap 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984 to 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984, amount: 100';
    // const result = parseSwapString(input);
    // console.log(result); // 输出：{ token1: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', token2: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', amount: 100 }

}
