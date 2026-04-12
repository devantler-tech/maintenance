import type { OrgRepo } from "@lib/gh/fetch-repos-in-org";

/**
 * A repository that violates a team-assignment policy.
 * Used by both "no admin team" and "no team" reports.
 */
export type RepoViolation = {
  /** Repository name */
  name: string;
  /** Full GitHub URL */
  url: string;
  /** Repository visibility (public/private/internal) */
  visibility: string;
  /** Date the repository was created (YYYY-MM-DD) */
  createdAt: string;
};

/**
 * Finds non-archived repositories that are missing from a set of "covered" repo names.
 *
 * The caller decides which repos count as covered (e.g. repos with any team, repos with an admin team).
 * This function simply compares that set against the full repo list.
 *
 * @param coveredRepoNames - Set of repo names that satisfy the policy
 * @param repos - All non-archived repositories in the organization
 * @returns Violations sorted alphabetically by repo name
 */
export default function findRepoViolations(
  coveredRepoNames: Set<string>,
  repos: OrgRepo[],
): RepoViolation[] {
  const violations: RepoViolation[] = [];
  for (const repo of repos) {
    if (!coveredRepoNames.has(repo.name)) {
      violations.push({
        name: repo.name,
        url: repo.url,
        visibility: repo.visibility,
        createdAt: repo.createdAt,
      });
    }
  }
  return violations.sort((a, b) => a.name.localeCompare(b.name));
}
