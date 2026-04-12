import type { Team } from "@lib/gh/fetch-teams-in-org";
import { RepoPermissionLevel } from "@lib/gh/fetch-teams-in-org";

export type MultiAdminViolation = {
  /** Repository name (without owner prefix) */
  name: string;
  /** Full GitHub URL for the repository */
  url: string;
  /** Number of teams with admin permission */
  adminCount: number;
  /** Admin team names, with deprecated teams marked */
  teams: { name: string; slug: string; isDeprecated: boolean }[];
};

/**
 * Finds repositories that have more than one team with admin permissions.
 *
 * Each repository should have exactly one admin team. This function identifies
 * repos violating that policy and marks which admin teams are deprecated
 * (contain "DEPRECATED" in their description).
 *
 * @param teams - All teams in the organization with their repository permissions
 * @param org - Organization slug (used for generating repo URLs)
 * @returns Violations sorted alphabetically by repo name
 */
export default function findViolations(
  teams: Team[],
  org: string,
): MultiAdminViolation[] {
  const repoAdminTeams = new Map<
    string,
    { name: string; slug: string; isDeprecated: boolean }[]
  >();

  for (const team of teams) {
    const isDeprecated = /deprecated/i.test(team.description ?? "");

    for (const [repoFullName, permission] of Object.entries(
      team.repositoryPermissions,
    )) {
      if (permission !== RepoPermissionLevel.ADMIN) continue;

      const repoName = repoFullName.split("/").pop()!;
      if (!repoAdminTeams.has(repoName)) {
        repoAdminTeams.set(repoName, []);
      }
      repoAdminTeams.get(repoName)!.push({
        name: team.name,
        slug: team.slug,
        isDeprecated,
      });
    }
  }

  const violations: MultiAdminViolation[] = [];
  for (const [repoName, adminTeams] of repoAdminTeams) {
    if (adminTeams.length > 1) {
      violations.push({
        name: repoName,
        url: `https://github.com/${org}/${repoName}`,
        adminCount: adminTeams.length,
        teams: adminTeams.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }

  return violations.sort((a, b) => a.name.localeCompare(b.name));
}
