import { describe, it, expect } from "vitest";
import { MockProvider } from "./index.js";
import type { ChatParams } from "@robotixai/harness-core";

const params: ChatParams = {
  model: "test",
  system: "sys",
  tools: [],
  messages: [{ role: "user", content: "hello" }],
  temperature: 0,
  maxTokens: 100,
};

describe("MockProvider", () => {
  it("records calls", async () => {
    const mock = new MockProvider();
    await mock.chat(params);
    expect(mock.calls).toHaveLength(1);
    expect(mock.calls[0].messages[0].content).toBe("hello");
  });

  it("returns canned responses in order", async () => {
    const mock = new MockProvider([
      { content: [{ type: "text", text: "one" }], stopReason: "end_turn", usage: { input: 0, output: 0 } },
      { content: [{ type: "text", text: "two" }], stopReason: "end_turn", usage: { input: 0, output: 0 } },
    ]);
    const r1 = await mock.chat(params);
    const r2 = await mock.chat(params);
    expect((r1.content[0] as { text: string }).text).toBe("one");
    expect((r2.content[0] as { text: string }).text).toBe("two");
  });

  it("falls back to default response when canned responses exhausted", async () => {
    const mock = new MockProvider();
    const r = await mock.chat(params);
    expect(r.stopReason).toBe("end_turn");
    expect((r.content[0] as { text: string }).text).toBe("mock response");
  });
});
