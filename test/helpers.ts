import type { OrgRepo } from "@lib/gh/fetch-repos-in-org";
import type { Team } from "@lib/gh/fetch-teams-in-org";
import { type RepoPermissionLevel } from "@lib/gh/fetch-teams-in-org";
import type { RepoViolation } from "@lib/gh/repo-violation";
import { expect, test } from "bun:test";

/**
 * Factory for creating Team test fixtures with sensible defaults.
 */
export function makeTeam(
  overrides: Partial<Team> & { name: string; slug: string },
): Team {
  return {
    description: null,
    members: [],
    repositories: [],
    repositoryPermissions: {},
    ...overrides,
  };
}

/**
 * Factory for creating OrgRepo test fixtures with sensible defaults.
 */
export function makeRepo(
  overrides: Partial<OrgRepo> & { name: string },
): OrgRepo {
  return {
    url: `https://github.com/devantler-tech/${overrides.name}`,
    visibility: "private",
    createdAt: "2024-01-01",
    ...overrides,
  };
}

/**
 * Registers shared test cases for any findViolations function that
 * accepts (teams, repos) and returns RepoViolation[].
 *
 * Always registers sorting and metadata-preservation tests.
 * When {@link options} is provided, also registers happy-path and
 * detection tests parameterized by permission level.
 */
export function describeRepoViolationBehavior(
  findViolations: (teams: Team[], repos: OrgRepo[]) => RepoViolation[],
  options?: {
    /** Permission level used to mark a repo as "covered" */
    permissionLevel: RepoPermissionLevel;
    /** Inserted into: "returns empty array when all repos have {coveredLabel}" */
    coveredLabel: string;
    /** Inserted into: "detects repos with {violationLabel}" */
    violationLabel: string;
  },
): void {
  if (options) {
    const { permissionLevel, coveredLabel, violationLabel } = options;

    const coveredTeams = (): Team[] => [
      makeTeam({
        name: "Team A",
        slug: "team-a",
        repositoryPermissions: {
          "devantler-tech/repo-1": permissionLevel,
        },
      }),
    ];

    test(`returns empty array when all repos have ${coveredLabel}`, () => {
      expect(
        findViolations(coveredTeams(), [makeRepo({ name: "repo-1" })]),
      ).toEqual([]);
    });

    test(`detects repos with ${violationLabel}`, () => {
      const violations = findViolations(coveredTeams(), [
        makeRepo({ name: "repo-1" }),
        makeRepo({ name: "repo-2" }),
      ]);

      expect(violations).toHaveLength(1);
      expect(violations[0].name).toBe("repo-2");
    });
  }

  test("sorts violations alphabetically", () => {
    const teams: Team[] = [];
    const repos: OrgRepo[] = [
      makeRepo({ name: "zebra" }),
      makeRepo({ name: "alpha" }),
      makeRepo({ name: "middle" }),
    ];

    const violations = findViolations(teams, repos);
    expect(violations.map((v) => v.name)).toEqual(["alpha", "middle", "zebra"]);
  });

  test("preserves repo metadata in violations", () => {
    const teams: Team[] = [];
    const repos: OrgRepo[] = [
      makeRepo({
        name: "my-repo",
        url: "https://github.com/devantler-tech/my-repo",
        visibility: "public",
        createdAt: "2023-06-15",
      }),
    ];

    const violations = findViolations(teams, repos);
    expect(violations[0]).toEqual({
      name: "my-repo",
      url: "https://github.com/devantler-tech/my-repo",
      visibility: "public",
      createdAt: "2023-06-15",
    });
  });
}
