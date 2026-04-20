// Records every call for test assertions. Returns canned responses in order.

import type { CompletionProvider, ChatParams, ChatResponse } from "@robotixai/harness-core";

export class MockProvider implements CompletionProvider {
  private responses: ChatResponse[];
  public calls: ChatParams[] = [];

  constructor(responses: ChatResponse[] = []) {
    this.responses = [...responses];
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    this.calls.push(params);
    return this.responses.shift() ?? {
      content: [{ type: "text", text: "mock response" }],
      stopReason: "end_turn",
      usage: { input: 0, output: 0 },
    };
  }
}
