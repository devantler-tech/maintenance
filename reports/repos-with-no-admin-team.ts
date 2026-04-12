import runRepoViolationReport from "@lib/run-repo-violation-report";
import findViolations from "./repos-with-no-admin-team/find-violations";
import generateMarkdownReport from "./repos-with-no-admin-team/generate-markdown-report";

await runRepoViolationReport(
  "repos-with-no-admin-team",
  "with no admin team",
  findViolations,
  generateMarkdownReport,
);
