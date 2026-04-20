// Re-exports everything consumers typically need, plus a dynamic factory
// that reads provider choice from env.
//
// Provider packages are optional peer dependencies — if a consumer only
// needs Ollama, they can install @robotixai/harness + @robotixai/harness-ollama
// and skip the Anthropic/OpenAI SDKs entirely.

export type {
  CompletionProvider,
  ChatParams,
  ChatResponse,
  ChatMessage,
  ContentBlock,
  ToolDefinition,
} from "@robotixai/harness-core";

import type { CompletionProvider } from "@robotixai/harness-core";

export type ProviderName =
  | "anthropic"
  | "openai"
  | "openrouter"
  | "ollama"
  | "mock";

export interface CreateProviderOptions {
  /** Provider name. Falls back to HARNESS_PROVIDER env, then "anthropic". */
  provider?: ProviderName | string;
}

/**
 * Dynamically loads and instantiates the requested provider.
 * Throws a clear error if the corresponding package isn't installed.
 */
export async function createProvider(
  options: CreateProviderOptions = {},
): Promise<CompletionProvider> {
  const name = (
    options.provider ||
    process.env.HARNESS_PROVIDER ||
    "anthropic"
  ).toLowerCase();

  switch (name) {
    case "anthropic": {
      const mod = await loadOptional("@robotixai/harness-anthropic", name);
      return new mod.AnthropicProvider(process.env.ANTHROPIC_API_KEY);
    }
    case "openai": {
      const mod = await loadOptional("@robotixai/harness-openai", name);
      return new mod.OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });
    }
    case "openrouter": {
      const mod = await loadOptional("@robotixai/harness-openrouter", name);
      return new mod.OpenRouterProvider();
    }
    case "ollama": {
      const mod = await loadOptional("@robotixai/harness-ollama", name);
      return new mod.OllamaProvider();
    }
    case "mock": {
      const mod = await loadOptional("@robotixai/harness-mock", name);
      return new mod.MockProvider();
    }
    default:
      throw new Error(
        `Unknown harness provider: ${name}. Valid: anthropic, openai, openrouter, ollama, mock`,
      );
  }
}

/** Default model per provider. Env overrides win. */
export function getDefaultModel(provider?: string): string {
  const p = (provider || process.env.HARNESS_PROVIDER || "anthropic").toLowerCase();
  const override = process.env.HARNESS_MODEL;
  if (override) return override;

  switch (p) {
    case "anthropic":
      return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
    case "openai":
      return process.env.OPENAI_MODEL || "gpt-4o";
    case "openrouter":
      return process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4";
    case "ollama":
      return process.env.OLLAMA_MODEL || "llama3";
    case "mock":
      return "mock";
    default:
      return "claude-sonnet-4-6";
  }
}

async function loadOptional(pkg: string, providerName: string) {
  try {
    // Variable import so TS/bundlers don't try to statically resolve optional peers.
    const mod = await import(/* @vite-ignore */ pkg);
    return mod;
  } catch (err) {
    throw new Error(
      `Provider "${providerName}" requires ${pkg}. Install it: pnpm add ${pkg}`,
    );
  }
}
