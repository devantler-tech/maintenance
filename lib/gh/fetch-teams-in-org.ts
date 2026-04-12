import type { Octokit } from "octokit";

export type Username = string;
export type Repo = {
  name: string;
  nameWithOwner: string;
  isArchived: boolean;
};
export enum RepoPermissionLevel {
  READ = "READ",
  TRIAGE = "TRIAGE",
  WRITE = "WRITE",
  MAINTAIN = "MAINTAIN",
  ADMIN = "ADMIN",
}
export type Team = {
  name: string;
  slug: string;
  description: string | null;
  members: Username[];
  repositories: Repo[];
  /** Maps 'org/repo-name' to the team's permission level */
  repositoryPermissions: Record<string, RepoPermissionLevel>;
};

/**
 * Fetches all teams in a GitHub organization along with their members and repositories.
 *
 * @param octokit - Authenticated Octokit instance
 * @param org - Organization slug
 * @param progressCallback - Optional callback for progress updates
 * @returns Array of teams with full details
 */
export default async function fetchTeamsInOrg(
  octokit: Octokit,
  org: string,
  progressCallback?: (
    fetchedTeamCount: number,
    totalTeamCount: number,
    nextTeamName: string,
  ) => void,
): Promise<Team[]> {
  const teams = await octokit.paginate(octokit.rest.teams.list, {
    org,
    per_page: 100,
  });
  progressCallback?.(0, teams.length, teams[0]?.name ?? "");

  const detailedTeams: Team[] = [];
  for (const team of teams) {
    console.log(
      `Fetching members and repos for team '${team.name}' (${team.slug})...`,
    );
    const [members, repos] = await Promise.all([
      octokit.paginate(octokit.rest.teams.listMembersInOrg, {
        org,
        team_slug: team.slug,
        per_page: 100,
      }),
      octokit.paginate(octokit.rest.teams.listReposInOrg, {
        org,
        team_slug: team.slug,
        per_page: 100,
      }),
    ]);
    const activeRepos = repos.filter((repo) => !repo.archived);
    detailedTeams.push({
      name: team.name,
      slug: team.slug,
      description: team.description,
      members: members.map((member) => member.login),
      repositories: activeRepos.map((repo) => ({
        name: repo.name,
        nameWithOwner: repo.full_name,
        isArchived: repo.archived || false,
      })),
      repositoryPermissions: Object.fromEntries(
        activeRepos.map((repo) => [
          repo.full_name,
          repo.permissions?.admin
            ? RepoPermissionLevel.ADMIN
            : repo.permissions?.maintain
              ? RepoPermissionLevel.MAINTAIN
              : repo.permissions?.push
                ? RepoPermissionLevel.WRITE
                : repo.permissions?.triage
                  ? RepoPermissionLevel.TRIAGE
                  : RepoPermissionLevel.READ,
        ]),
      ),
    });
    progressCallback?.(
      detailedTeams.length,
      teams.length,
      teams[detailedTeams.length]?.name ?? "",
    );
  }
  return detailedTeams;
}
