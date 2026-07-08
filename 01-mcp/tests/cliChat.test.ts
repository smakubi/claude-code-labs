import { describe, it, expect } from "vitest";
import {
  convertPromptMessageToMessageParam,
  resolveId,
} from "../src/core/cliChat.js";
import type { PromptMessage } from "@modelcontextprotocol/sdk/types.js";

describe("resolveId", () => {
  const ids = [
    "deposition.md",
    "report.pdf",
    "financials.docx",
    "outlook.pdf",
    "plan.md",
    "spec.txt",
  ];

  it("returns an exact match", () => {
    expect(resolveId("plan.md", ids)).toBe("plan.md");
  });

  it("resolves an unambiguous prefix", () => {
    expect(resolveId("pl", ids)).toBe("plan.md");
    expect(resolveId("spec", ids)).toBe("spec.txt");
  });

  it("is case-insensitive for prefixes", () => {
    expect(resolveId("PL", ids)).toBe("plan.md");
  });

  it("returns undefined for an ambiguous prefix", () => {
    const ambiguous = ["report.pdf", "report.md", "plan.md"];
    expect(resolveId("report", ambiguous)).toBeUndefined();
  });

  it("returns undefined when nothing matches", () => {
    expect(resolveId("zzz", ids)).toBeUndefined();
  });

  it("prefers an exact match over a longer prefix sibling", () => {
    const withSibling = ["plan", "plan.md"];
    expect(resolveId("plan", withSibling)).toBe("plan");
  });
});

describe("convertPromptMessageToMessageParam", () => {
  it("converts a single text content prompt message", () => {
    const pm: PromptMessage = {
      role: "user",
      content: { type: "text", text: "hello world" },
    };
    expect(convertPromptMessageToMessageParam(pm)).toEqual({
      role: "user",
      content: "hello world",
    });
  });

  it("maps assistant role through", () => {
    const pm: PromptMessage = {
      role: "assistant",
      content: { type: "text", text: "hi" },
    };
    expect(convertPromptMessageToMessageParam(pm)).toEqual({
      role: "assistant",
      content: "hi",
    });
  });

  it("returns empty string content for non-text content", () => {
    const pm = {
      role: "user",
      content: { type: "image", data: "...", mimeType: "image/png" },
    } as unknown as PromptMessage;
    expect(convertPromptMessageToMessageParam(pm)).toEqual({
      role: "user",
      content: "",
    });
  });
});
