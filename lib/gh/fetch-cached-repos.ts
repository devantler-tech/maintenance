import fetchWithCache from "@lib/cache";
import fetchReposInOrg, { type OrgRepo } from "@lib/gh/fetch-repos-in-org";
import { info } from "@lib/log";
import type { Octokit } from "octokit";

/**
 * Fetches non-archived repos for an organization with file-based caching and progress logging.
 *
 * @param octokit - Authenticated Octokit instance
 * @param org - Organization slug
 * @returns Array of non-archived repositories
 */
export default async function fetchCachedRepos(
  octokit: Octokit,
  org: string,
): Promise<OrgRepo[]> {
  return fetchWithCache<OrgRepo[]>(`${org}-repos`, async () => {
    info(`Fetching repos in the '${org}' organization...`);
    const repos = await fetchReposInOrg(octokit, org, {
      includeArchived: false,
    });
    info(`Fetched ${repos.length} repos`);
    return repos;
  });
}
