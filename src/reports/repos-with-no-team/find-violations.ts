import type { OrgRepo } from "@lib/gh/fetch-repos-in-org";
import type { Team } from "@lib/gh/fetch-teams-in-org";
import findRepoViolations, { type RepoViolation } from "@lib/gh/repo-violation";

export type { RepoViolation as NoTeamViolation };

/**
 * Finds non-archived repositories that have no team assigned at any permission level.
 *
 * These repos may only have individual collaborators or no access configured at all.
 *
 * @param teams - All teams in the organization with their repository permissions
 * @param repos - All non-archived repositories in the organization
 * @returns Violations sorted alphabetically by repo name
 */
export default function findViolations(
  teams: Team[],
  repos: OrgRepo[],
): RepoViolation[] {
  const reposWithAnyTeam = new Set<string>();

  for (const team of teams) {
    for (const repoFullName of Object.keys(team.repositoryPermissions)) {
      const repoName = repoFullName.split("/").pop()!;
      reposWithAnyTeam.add(repoName);
    }
  }

  return findRepoViolations(reposWithAnyTeam, repos);
}
