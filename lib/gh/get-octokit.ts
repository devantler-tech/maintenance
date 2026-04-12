import { Octokit } from "octokit";

let octokit: Octokit | undefined;

/**
 * Gets or creates an authenticated Octokit instance.
 * Requires GH_TOKEN or GITHUB_TOKEN environment variable.
 */
export default function getOctokit() {
  if (octokit) return octokit;

  const GITHUB_TOKEN = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    throw new Error("GH_TOKEN/GITHUB_TOKEN env variable is required");
  }

  octokit = new Octokit({ auth: GITHUB_TOKEN });
  return octokit;
}
