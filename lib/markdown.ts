import type { RepoViolation } from "@lib/gh/repo-violation";

/**
 * Renders a markdown table for repo-violation reports.
 *
 * Shared by the "no admin team" and "no team" reports which have identical
 * table structure (Repository | Visibility | Created).
 *
 * @param title - Report heading
 * @param violations - Repos that violate the policy
 * @param description - One-line description shown above the count
 * @param policyNote - Second line describing the governance policy
 * @param summaryLabel - Label used in the bold count line
 * @returns Full markdown report as a string
 */
export default function renderRepoViolationReport(
  title: string,
  violations: RepoViolation[],
  description: string,
  policyNote: string,
  summaryLabel: string,
): string {
  const date = new Date().toISOString().split("T")[0];

  if (violations.length === 0) {
    return `## ${title}

✅ ${policyNote} No violations found.

_Last checked: ${date}_
`;
  }

  const lines: string[] = [];

  lines.push(`## ${title}`);
  lines.push(``);
  lines.push(description);
  lines.push(policyNote);
  lines.push(``);
  lines.push(`**Found ${violations.length} repositories ${summaryLabel}.**`);
  lines.push(``);
  lines.push(`| Repository | Visibility | Created |`);
  lines.push(`|------------|:----------:|---------|`);

  for (const v of violations) {
    lines.push(`| [${v.name}](${v.url}) | ${v.visibility} | ${v.createdAt} |`);
  }

  lines.push(``);
  lines.push(`_Last checked: ${date}_`);
  lines.push(``);

  return lines.join("\n");
}
