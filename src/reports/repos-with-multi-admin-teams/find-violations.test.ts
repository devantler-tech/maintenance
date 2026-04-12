import type { Team } from "@lib/gh/fetch-teams-in-org";
import { RepoPermissionLevel } from "@lib/gh/fetch-teams-in-org";
import { makeTeam } from "@test/helpers";
import { describe, expect, test } from "bun:test";
import findViolations from "./find-violations";

describe("findViolations", () => {
  test("returns empty array when no repos have multiple admin teams", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "devantler-tech/repo-1": RepoPermissionLevel.ADMIN,
        },
      }),
      makeTeam({
        name: "Team B",
        slug: "team-b",
        repositoryPermissions: {
          "devantler-tech/repo-2": RepoPermissionLevel.ADMIN,
        },
      }),
    ];

    expect(findViolations(teams, "devantler-tech")).toEqual([]);
  });

  test("detects repos with multiple admin teams", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "devantler-tech/shared-repo": RepoPermissionLevel.ADMIN,
        },
      }),
      makeTeam({
        name: "Team B",
        slug: "team-b",
        repositoryPermissions: {
          "devantler-tech/shared-repo": RepoPermissionLevel.ADMIN,
        },
      }),
    ];

    const violations = findViolations(teams, "devantler-tech");
    expect(violations).toHaveLength(1);
    expect(violations[0].name).toBe("shared-repo");
    expect(violations[0].adminCount).toBe(2);
    expect(violations[0].teams).toHaveLength(2);
  });

  test("ignores teams with non-admin permissions", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "devantler-tech/repo-1": RepoPermissionLevel.ADMIN,
        },
      }),
      makeTeam({
        name: "Team B",
        slug: "team-b",
        repositoryPermissions: {
          "devantler-tech/repo-1": RepoPermissionLevel.WRITE,
        },
      }),
    ];

    expect(findViolations(teams, "devantler-tech")).toEqual([]);
  });

  test("marks deprecated teams correctly", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        description: "DEPRECATED - old team",
        repositoryPermissions: {
          "devantler-tech/repo-1": RepoPermissionLevel.ADMIN,
        },
      }),
      makeTeam({
        name: "Team B",
        slug: "team-b",
        description: "Active team",
        repositoryPermissions: {
          "devantler-tech/repo-1": RepoPermissionLevel.ADMIN,
        },
      }),
    ];

    const violations = findViolations(teams, "devantler-tech");
    expect(violations).toHaveLength(1);
    const teamA = violations[0].teams.find((t) => t.slug === "team-a");
    const teamB = violations[0].teams.find((t) => t.slug === "team-b");
    expect(teamA?.isDeprecated).toBe(true);
    expect(teamB?.isDeprecated).toBe(false);
  });

  test("sorts violations alphabetically by repo name", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "devantler-tech/zebra": RepoPermissionLevel.ADMIN,
          "devantler-tech/alpha": RepoPermissionLevel.ADMIN,
        },
      }),
      makeTeam({
        name: "Team B",
        slug: "team-b",
        repositoryPermissions: {
          "devantler-tech/zebra": RepoPermissionLevel.ADMIN,
          "devantler-tech/alpha": RepoPermissionLevel.ADMIN,
        },
      }),
    ];

    const violations = findViolations(teams, "devantler-tech");
    expect(violations).toHaveLength(2);
    expect(violations[0].name).toBe("alpha");
    expect(violations[1].name).toBe("zebra");
  });

  test("generates correct URL from org parameter", () => {
    const teams: Team[] = [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "myorg/repo": RepoPermissionLevel.ADMIN,
        },
      }),
      makeTeam({
        name: "Team B",
        slug: "team-b",
        repositoryPermissions: {
          "myorg/repo": RepoPermissionLevel.ADMIN,
        },
      }),
    ];

    const violations = findViolations(teams, "myorg");
    expect(violations[0].url).toBe("https://github.com/myorg/repo");
  });
});
