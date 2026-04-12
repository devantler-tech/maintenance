import { describe, expect, it } from "bun:test";
import { readFile, mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { truncateForGitHub, writeReportOutput } from "./report";

describe("truncateForGitHub", () => {
  it("returns the original string when under the limit", () => {
    const short = "Hello, world!";
    expect(truncateForGitHub(short)).toBe(short);
  });

  it("returns the original string when exactly at the limit", () => {
    const exact = "x".repeat(65_536);
    expect(truncateForGitHub(exact)).toBe(exact);
  });

  it("truncates at a line boundary and appends a notice", () => {
    const lines = Array.from(
      { length: 2000 },
      (_, i) => `Line ${i + 1}: ${"x".repeat(40)}`,
    );
    const report = lines.join("\n");
    expect(report.length).toBeGreaterThan(65_536);

    const result = truncateForGitHub(report);
    expect(result.length).toBeLessThanOrEqual(65_536);
    expect(result).toContain("truncated");
    expect(result).toContain("65 536");
    const beforeNotice = result.split("\n\n> **Note:**")[0];
    const lastLine = beforeNotice.trimEnd().split("\n").pop();
    expect(lastLine).toMatch(/^Line \d+: x{40}$/);
  });

  it("preserves complete markdown table rows", () => {
    const header = "| Repo | Teams |\n|------|-------|\n";
    const rows = Array.from(
      { length: 2000 },
      (_, i) =>
        `| repo-${String(i).padStart(4, "0")} | team-alpha-long-name, team-beta-long-name, team-gamma-long-name |`,
    );
    const report = header + rows.join("\n");
    expect(report.length).toBeGreaterThan(65_536);

    const result = truncateForGitHub(report);
    expect(result.length).toBeLessThanOrEqual(65_536);
    const beforeNotice = result.split("\n\n> **Note:**")[0];
    const lastLine = beforeNotice.trimEnd().split("\n").pop();
    expect(lastLine).toMatch(
      /^\| repo-\d{4} \| team-alpha-long-name, team-beta-long-name, team-gamma-long-name \|$/,
    );
  });

  it("handles a single very long line without newlines", () => {
    const report = "x".repeat(70_000);
    expect(report.length).toBeGreaterThan(65_536);

    const result = truncateForGitHub(report);
    expect(result.length).toBeLessThanOrEqual(65_536);
    expect(result).toContain("truncated");
    expect(result).toMatch(/^x+\n\n> \*\*Note:\*\*/);
  });
});

describe("writeReportOutput", () => {
  it("writes truncated file and full file when report exceeds limit", async () => {
    const originalCwd = process.cwd();
    const dir = await mkdtemp(join(tmpdir(), "report-test-"));
    try {
      process.chdir(dir);
      const longReport = "x\n".repeat(40_000); // ~80 000 chars
      const result = await writeReportOutput(
        "test-slug",
        "test-org",
        longReport,
        true,
      );

      const mainContent = await readFile(result, "utf-8");
      expect(mainContent.length).toBeLessThanOrEqual(65_536);
      expect(mainContent).toContain("truncated");

      const fullFile = result.replace(".md", "-full.md");
      const fullContent = await readFile(fullFile, "utf-8");
      expect(fullContent).toBe(longReport);
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true });
    }
  });

  it("writes only the main file when report is within limit", async () => {
    const originalCwd = process.cwd();
    const dir = await mkdtemp(join(tmpdir(), "report-test-"));
    try {
      process.chdir(dir);
      const shortReport = "All good!";
      const result = await writeReportOutput(
        "test-slug",
        "test-org",
        shortReport,
        false,
      );

      const mainContent = await readFile(result, "utf-8");
      expect(mainContent).toBe(shortReport);

      const fullFile = result.replace(".md", "-full.md");
      expect(await Bun.file(fullFile).exists()).toBe(false);
    } finally {
      process.chdir(originalCwd);
      await rm(dir, { recursive: true });
    }
  });
});
