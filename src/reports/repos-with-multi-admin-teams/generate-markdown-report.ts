import type { MultiAdminViolation } from "./find-violations";

/**
 * Generates a markdown report for repositories with multiple admin teams.
 *
 * @param org - Organization slug
 * @param violations - Repos with multiple admin teams
 * @returns Markdown report as a string
 */
export default function generateMarkdownReport(
  org: string,
  violations: MultiAdminViolation[],
): string {
  const teamUrl = (slug: string) =>
    `https://github.com/orgs/${org}/teams/${slug}`;

  if (violations.length === 0) {
    return `## Repositories with Multiple Admin Teams

✅ All repositories in \`${org}\` have at most one admin team. No violations found.

_Last checked: ${new Date().toISOString().split("T")[0]}_
`;
  }

  const deprecatedCount = new Set(
    violations.flatMap((v) =>
      v.teams.filter((t) => t.isDeprecated).map((t) => t.slug),
    ),
  ).size;

  const lines: string[] = [];

  lines.push(`## Repositories with Multiple Admin Teams`);
  lines.push(``);
  lines.push(
    `The following repositories have more than one team with admin permissions.`,
  );
  lines.push(`Each repository should have exactly one admin team.`);
  lines.push(``);
  lines.push(
    `**Found ${violations.length} repositories with multiple admin teams.**`,
  );
  if (deprecatedCount > 0) {
    lines.push(``);
    lines.push(
      `> ${deprecatedCount} deprecated team${deprecatedCount === 1 ? "" : "s"} still have admin access and should be removed.`,
    );
  }
  lines.push(``);
  lines.push(`| Repository | Admin Teams | Team Names |`);
  lines.push(`|------------|:-----------:|------------|`);

  for (const v of violations) {
    const teamNames = v.teams
      .map((t) => {
        const link = `[${t.name}](${teamUrl(t.slug)})`;
        if (t.isDeprecated) {
          return `~~${link}~~`;
        }
        return link;
      })
      .join(", ");

    lines.push(`| [${v.name}](${v.url}) | ${v.adminCount} | ${teamNames} |`);
  }

  lines.push(``);
  lines.push(`_Last checked: ${new Date().toISOString().split("T")[0]}_`);
  lines.push(``);

  return lines.join("\n");
}
