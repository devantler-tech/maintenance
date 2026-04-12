import type { OrgRepo } from "@lib/gh/fetch-repos-in-org";
import type { Team } from "@lib/gh/fetch-teams-in-org";
import { RepoPermissionLevel } from "@lib/gh/fetch-teams-in-org";
import {
  describeRepoViolationBehavior,
  makeRepo,
  makeTeam,
} from "@test/helpers";
import { describe, expect, test } from "bun:test";
import findViolations from "./find-violations";

describe("findViolations", () => {
  test("does not count write-only teams as admin", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "devantler-tech/repo-1": RepoPermissionLevel.WRITE,
        },
      }),
    ];
    const repos: OrgRepo[] = [makeRepo({ name: "repo-1" })];

    const violations = findViolations(teams, repos);
    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe("repo-1");
  });

  describeRepoViolationBehavior(findViolations, {
    permissionLevel: RepoPermissionLevel.ADMIN,
    coveredLabel: "an admin team",
    violationLabel: "no admin team",
  });
});
