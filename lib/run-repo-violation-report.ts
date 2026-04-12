import fetchCachedRepos from "@lib/gh/fetch-cached-repos";
import fetchCachedTeams from "@lib/gh/fetch-cached-teams";
import type { OrgRepo } from "@lib/gh/fetch-repos-in-org";
import type { Team } from "@lib/gh/fetch-teams-in-org";
import getOctokit from "@lib/gh/get-octokit";
import type { RepoViolation } from "@lib/gh/repo-violation";
import { info, stderr } from "@lib/log";
import { parseOrgArg, writeReportOutput } from "@lib/report";

/**
 * Runs a repo-violation report end-to-end: fetch data, find violations,
 * generate a markdown report, and write output.
 *
 * Shared by the "no admin team" and "no team" reports which follow the
 * same fetch → find → render → write pattern.
 *
 * @param slug - Report identifier used for filenames
 * @param summaryLabel - Human-readable label for the summary line
 * @param findViolations - Function that finds violations from teams and repos
 * @param generateMarkdownReport - Function that renders violations as markdown
 */
export default async function runRepoViolationReport(
  slug: string,
  summaryLabel: string,
  findViolations: (teams: Team[], repos: OrgRepo[]) => RepoViolation[],
  generateMarkdownReport: (violations: RepoViolation[]) => string,
): Promise<void> {
  const org = parseOrgArg();
  const octokit = getOctokit();

  const [teams, repos] = await Promise.all([
    fetchCachedTeams(octokit, org),
    fetchCachedRepos(octokit, org),
  ]);
  info(
    `Fetched ${teams.length} teams and ${repos.length} repos in the '${org}' organization`,
  );

  const violations = findViolations(teams, repos);
  const report = generateMarkdownReport(violations);
  await writeReportOutput(slug, org, report, violations.length > 0);

  stderr(`
Summary:
  Non-archived repos: ${repos.length}
  Repos ${summaryLabel}: ${violations.length}
`);
}
