import { OpenAIProvider } from "@robotixai/harness-openai";

export class OpenRouterProvider extends OpenAIProvider {
  constructor(apiKey?: string) {
    super({
      apiKey: apiKey || process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
}
