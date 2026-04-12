import type { OrgRepo } from "@lib/gh/fetch-repos-in-org";
import type { Team } from "@lib/gh/fetch-teams-in-org";
import { RepoPermissionLevel } from "@lib/gh/fetch-teams-in-org";
import findRepoViolations, { type RepoViolation } from "@lib/gh/repo-violation";

export type { RepoViolation as NoAdminViolation };

/**
 * Finds non-archived repositories that have no team with admin permissions.
 *
 * Compares all repos in the org against the set of repos that have at least
 * one team with admin access. Repos not in the admin set are violations.
 *
 * @param teams - All teams in the organization with their repository permissions
 * @param repos - All non-archived repositories in the organization
 * @returns Violations sorted alphabetically by repo name
 */
export default function findViolations(
  teams: Team[],
  repos: OrgRepo[],
): RepoViolation[] {
  const reposWithAdmin = new Set<string>();

  for (const team of teams) {
    for (const [repoFullName, permission] of Object.entries(
      team.repositoryPermissions,
    )) {
      if (permission === RepoPermissionLevel.ADMIN) {
        const repoName = repoFullName.split("/").pop()!;
        reposWithAdmin.add(repoName);
      }
    }
  }

  return findRepoViolations(reposWithAdmin, repos);
}
