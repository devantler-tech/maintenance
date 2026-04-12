import renderRepoViolationReport from "@lib/markdown";
import type { NoTeamViolation } from "./find-violations";

/**
 * Generates a markdown report for repositories with no team assigned.
 *
 * @param violations - Repos without any team
 * @returns Markdown report as a string
 */
export default function generateMarkdownReport(
  violations: NoTeamViolation[],
): string {
  return renderRepoViolationReport(
    "Repositories with No Team Assigned",
    violations,
    `The following non-archived repositories have no team assigned (any permission level).`,
    `These repositories may only have individual collaborators or no access configured.`,
    "with no team assigned",
  );
}
