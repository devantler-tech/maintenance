import fetchWithCache from "@lib/cache";
import fetchTeamsInOrg, { type Team } from "@lib/gh/fetch-teams-in-org";
import { info } from "@lib/log";
import type { Octokit } from "octokit";

/**
 * Fetches teams for an organization with file-based caching and progress logging.
 *
 * @param octokit - Authenticated Octokit instance
 * @param org - Organization slug
 * @returns Array of teams with full details
 */
export default async function fetchCachedTeams(
  octokit: Octokit,
  org: string,
): Promise<Team[]> {
  return fetchWithCache<Team[]>(`${org}-teams`, async () => {
    info(`Fetching teams in the '${org}' organization...`);
    const teams = await fetchTeamsInOrg(octokit, org, (fetched, total) => {
      info(`Fetched ${fetched} / ${total} teams...`);
    });
    info(`Fetched ${teams.length} teams`);
    return teams;
  });
}
