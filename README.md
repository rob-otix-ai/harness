# @robotixai/harness

Provider-agnostic model harness. One interface, four providers (Anthropic, OpenAI, Ollama, OpenRouter), same tool-use semantics.

Extracted from [Lexius](https://github.com/rob-otix-ai/lexius) so it can be reused across projects without dragging in any product-specific code.

## Why

The harness is ~30 lines of types plus a per-provider translator. It lets you write agent code once and switch between providers (cloud, local, routed) via a single env var — without pulling in a 10,000-line SDK like Vercel AI or LangChain.

Key design points:

- **Single interface.** `CompletionProvider.chat(params)` returns a normalised `ChatResponse`. No streaming in v0.1 (add later if needed).
- **Tool-use is normalised.** Anthropic's `{ name, description, input_schema }` and OpenAI's `{ type: "function", function: {...} }` are both wrapped. Tool-result messages are mapped to each provider's convention internally.
- **SDKs are peer dependencies.** If you only want Ollama, you don't install `@anthropic-ai/sdk`.
- **Zero runtime deps in `harness-core`.** Just types.

## Packages

| Package | Description |
|---------|-------------|
| [`@robotixai/harness`](./packages/factory) | Top-level entry: `createProvider()`, `getDefaultModel()`, re-exports core types |
| [`@robotixai/harness-core`](./packages/core) | `CompletionProvider`, `ChatParams`, `ContentBlock`, `ToolDefinition` — zero deps |
| [`@robotixai/harness-anthropic`](./packages/anthropic) | `AnthropicProvider` (peerDep: `@anthropic-ai/sdk`) |
| [`@robotixai/harness-openai`](./packages/openai) | `OpenAIProvider` (peerDep: `openai`) |
| [`@robotixai/harness-ollama`](./packages/ollama) | `OllamaProvider` — extends OpenAI with local defaults |
| [`@robotixai/harness-openrouter`](./packages/openrouter) | `OpenRouterProvider` — extends OpenAI with OR defaults |
| [`@robotixai/harness-mock`](./packages/mock) | `MockProvider` for tests |

## Quick start

```bash
pnpm add @robotixai/harness @robotixai/harness-anthropic @anthropic-ai/sdk
```

```ts
import { createProvider, getDefaultModel } from "@robotixai/harness";

const provider = await createProvider();              // reads HARNESS_PROVIDER
const model    = getDefaultModel();                   // reads HARNESS_MODEL

const response = await provider.chat({
  model,
  system: "You are a helpful assistant.",
  tools: [],
  messages: [{ role: "user", content: "Hello." }],
  temperature: 0,
  maxTokens: 1024,
});
```

Switch providers with an env var:

```bash
HARNESS_PROVIDER=anthropic  ANTHROPIC_API_KEY=sk-ant-...   node app.js
HARNESS_PROVIDER=openai     OPENAI_API_KEY=sk-...          node app.js
HARNESS_PROVIDER=openrouter OPENROUTER_API_KEY=sk-or-...   node app.js
HARNESS_PROVIDER=ollama                                    node app.js
```

## Environment variables

| Variable | Used when | Default |
|----------|-----------|---------|
| `HARNESS_PROVIDER` | Selects provider | `anthropic` |
| `HARNESS_MODEL` | Overrides default model for the selected provider | per-provider default |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Anthropic | model default `claude-sonnet-4-6` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI | model default `gpt-4o` |
| `OPENROUTER_API_KEY` / `OPENROUTER_MODEL` | OpenRouter | model default `anthropic/claude-sonnet-4` |
| `OLLAMA_URL` / `OLLAMA_MODEL` | Ollama | URL default `http://localhost:11434/v1`, model `llama3` |

## Using a specific provider directly

Skip the factory if you already know which provider you want. This avoids the dynamic import and gives you full constructor control.

```ts
import { AnthropicProvider } from "@robotixai/harness-anthropic";

const provider = new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
```

## Testing

`MockProvider` records every call and returns canned responses in order:

```ts
import { MockProvider } from "@robotixai/harness-mock";

const mock = new MockProvider([
  { content: [{ type: "text", text: "test" }], stopReason: "end_turn", usage: { input: 0, output: 0 } },
]);

await agent.run({ provider: mock });

expect(mock.calls).toHaveLength(1);
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT
