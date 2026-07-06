import { describe, it, expect } from "vitest";
import { buildCompletions, completionToken } from "../src/core/cli.js";

const prompts = [{ name: "format" }, { name: "summarize" }];
const resources = ["deposition.md", "report.pdf", "plan.md"];

describe("buildCompletions", () => {
  it("completes @-mentions by resource prefix", () => {
    expect(buildCompletions("Tell me about @dep", prompts, resources)).toEqual([
      "deposition.md",
    ]);
  });

  it("completes /commands by prompt-name prefix", () => {
    expect(buildCompletions("/for", prompts, resources)).toEqual(["format"]);
  });

  it("completes a command argument by resource prefix", () => {
    expect(buildCompletions("/format rep", prompts, resources)).toEqual([
      "report.pdf",
    ]);
  });

  it("returns nothing for plain text", () => {
    expect(buildCompletions("hello world", prompts, resources)).toEqual([]);
  });
});

describe("completionToken", () => {
  it("returns the text after the last @ for @-mentions", () => {
    expect(completionToken("Tell me about @dep")).toBe("dep");
  });

  it("returns just @ token when nothing typed yet", () => {
    expect(completionToken("Tell me about @")).toBe("");
  });

  it("returns the command word for /commands", () => {
    expect(completionToken("/for")).toBe("for");
  });

  it("returns the argument word for /cmd <arg>", () => {
    expect(completionToken("/format rep")).toBe("rep");
  });

  it("returns the whole line for plain text", () => {
    expect(completionToken("hello world")).toBe("hello world");
  });
});
