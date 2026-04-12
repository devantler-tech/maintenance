import { info, warn } from "@lib/log";
import { writeFile } from "fs/promises";

/** GitHub Issues body field maximum character count. */
const GITHUB_ISSUE_BODY_LIMIT = 65_536;

/**
 * Truncates a markdown report so it fits within the GitHub issue body limit.
 *
 * Prefers cutting at the last newline that fits within the budget.
 * Falls back to a hard cut at the budget boundary when no newline is found.
 * Returns the original string unchanged when it is already within the limit.
 *
 * @param report - Full markdown report content
 * @returns Truncated report if necessary, otherwise the original
 */
export function truncateForGitHub(report: string): string {
  if (report.length <= GITHUB_ISSUE_BODY_LIMIT) return report;

  const notice =
    "\n\n> **Note:** This report was truncated because it exceeded GitHub's issue body limit (65 536 characters). A full, untruncated version was saved as a separate `-full.md` file during the workflow run.\n";

  const budget = GITHUB_ISSUE_BODY_LIMIT - notice.length;
  const cutIndex = report.lastIndexOf("\n", budget);
  const safeCut = cutIndex > 0 ? cutIndex : budget;

  return report.slice(0, safeCut) + notice;
}

/**
 * Parses the organization slug from the first CLI argument.
 * Defaults to "devantler-tech" if not provided.
 *
 * @returns The organization slug
 */
export function parseOrgArg(): string {
  const org = process.argv[2]?.trim() || "devantler-tech";
  if (!/^[A-Za-z0-9-]+$/.test(org)) {
    throw new Error(
      `Invalid organization slug: "${org}". Only alphanumeric characters and hyphens are allowed.`,
    );
  }
  return org;
}

/**
 * Writes a report to a dated file and sets GitHub Actions outputs.
 *
 * @param slug - Report slug used in the filename (e.g. "repos-with-no-team")
 * @param org - Organization slug
 * @param report - The markdown report content
 * @param hasViolations - Whether the report found any violations
 * @returns The path to the written report file
 */
export async function writeReportOutput(
  slug: string,
  org: string,
  report: string,
  hasViolations: boolean,
): Promise<string> {
  if (!/^[A-Za-z0-9-]+$/.test(slug)) {
    throw new Error(
      `Invalid report slug: "${slug}". Only alphanumeric characters and hyphens are allowed.`,
    );
  }
  const reportDate = new Date().toISOString().split("T")[0];
  const reportFile = `./report-${org}-${slug}-${reportDate}.md`;
  const truncated = truncateForGitHub(report);
  if (truncated.length < report.length) {
    warn(
      `Report truncated from ${report.length} to ${truncated.length} characters (GitHub issue body limit)`,
    );
    const fullReportFile = `./report-${org}-${slug}-${reportDate}-full.md`;
    await writeFile(fullReportFile, report, "utf-8");
    info(`Full (untruncated) report saved to ${fullReportFile}`);
  }
  await writeFile(reportFile, truncated, "utf-8");
  info(`Generated report at ${reportFile}`);

  if (process.env.GITHUB_OUTPUT) {
    const output = `report-path=${reportFile}\nhas-violations=${hasViolations}\n`;
    await writeFile(process.env.GITHUB_OUTPUT, output, { flag: "a" });
    info(`Wrote output to GITHUB_OUTPUT`);
  }

  return reportFile;
}
