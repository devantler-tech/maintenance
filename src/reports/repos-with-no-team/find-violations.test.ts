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
  test("counts any permission level as having a team", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "devantler-tech/repo-read": RepoPermissionLevel.READ,
          "devantler-tech/repo-write": RepoPermissionLevel.WRITE,
          "devantler-tech/repo-admin": RepoPermissionLevel.ADMIN,
          "devantler-tech/repo-triage": RepoPermissionLevel.TRIAGE,
          "devantler-tech/repo-maintain": RepoPermissionLevel.MAINTAIN,
        },
      }),
    ];
    const repos: OrgRepo[] = [
      makeRepo({ name: "repo-read" }),
      makeRepo({ name: "repo-write" }),
      makeRepo({ name: "repo-admin" }),
      makeRepo({ name: "repo-triage" }),
      makeRepo({ name: "repo-maintain" }),
      makeRepo({ name: "repo-orphan" }),
    ];

    const violations = findViolations(teams, repos);
    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe("repo-orphan");
  });

  describeRepoViolationBehavior(findViolations, {
    permissionLevel: RepoPermissionLevel.READ,
    coveredLabel: "a team",
    violationLabel: "no team at any permission level",
  });
});
