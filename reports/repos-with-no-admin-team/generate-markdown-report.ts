import renderRepoViolationReport from "@lib/markdown";
import type { NoAdminViolation } from "./find-violations";

/**
 * Generates a markdown report for repositories with no admin team.
 *
 * @param violations - Repos without any admin team
 * @returns Markdown report as a string
 */
export default function generateMarkdownReport(
  violations: NoAdminViolation[],
): string {
  return renderRepoViolationReport(
    "Repositories with No Admin Team",
    violations,
    `The following non-archived repositories have no team with admin permissions assigned.`,
    `Each repository should have exactly one admin team.`,
    "with no admin team",
  );
}
