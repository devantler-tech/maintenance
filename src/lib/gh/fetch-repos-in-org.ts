import type { Octokit } from "octokit";

export type OrgRepo = {
  name: string;
  url: string;
  visibility: string;
  createdAt: string;
};

/**
 * Fetches all repositories in a GitHub organization.
 *
 * @param octokit - Authenticated Octokit instance
 * @param org - Organization slug
 * @param options - Filtering options
 * @returns Array of repositories
 */
export default async function fetchReposInOrg(
  octokit: Octokit,
  org: string,
  options: { includeArchived?: boolean } = {},
): Promise<OrgRepo[]> {
  const { includeArchived = false } = options;

  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org,
    per_page: 100,
    type: "all",
  });

  const filtered = includeArchived
    ? repos
    : repos.filter((repo) => !repo.archived);

  return filtered.map((repo) => ({
    name: repo.name,
    url: repo.html_url,
    visibility: repo.visibility ?? "unknown",
    createdAt: repo.created_at?.split("T")[0] ?? "Unknown",
  }));
}
