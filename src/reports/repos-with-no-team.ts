import runRepoViolationReport from "@lib/run-repo-violation-report";
import findViolations from "./repos-with-no-team/find-violations";
import generateMarkdownReport from "./repos-with-no-team/generate-markdown-report";

await runRepoViolationReport(
  "repos-with-no-team",
  "with no team assigned",
  findViolations,
  generateMarkdownReport,
);
