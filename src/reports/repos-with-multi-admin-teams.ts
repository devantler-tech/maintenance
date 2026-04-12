import fetchCachedTeams from "@lib/gh/fetch-cached-teams";
import getOctokit from "@lib/gh/get-octokit";
import { info, stderr } from "@lib/log";
import { parseOrgArg, writeReportOutput } from "@lib/report";
import findViolations from "./repos-with-multi-admin-teams/find-violations";
import generateMarkdownReport from "./repos-with-multi-admin-teams/generate-markdown-report";

const org = parseOrgArg();
const octokit = getOctokit();

const teams = await fetchCachedTeams(octokit, org);
info(`Fetched ${teams.length} teams in the '${org}' organization`);

const violations = findViolations(teams, org);
const report = generateMarkdownReport(org, violations);
await writeReportOutput(
  "repos-with-multi-admin-teams",
  org,
  report,
  violations.length > 0,
);

stderr(`
Summary:
  Repositories with multiple admin teams: ${violations.length}
`);
