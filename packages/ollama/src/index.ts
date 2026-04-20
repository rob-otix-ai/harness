import { OpenAIProvider } from "@robotixai/harness-openai";

export class OllamaProvider extends OpenAIProvider {
  constructor(baseURL?: string) {
    super({
      apiKey: "ollama",
      baseURL: baseURL || process.env.OLLAMA_URL || "http://localhost:11434/v1",
    });
  }
}
