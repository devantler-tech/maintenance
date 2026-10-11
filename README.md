# maintenance

Tools for GitHub organization maintainers to find repositories with missing or conflicting team
ownership. The CLI writes Markdown reports; the configured scheduled workflows create or update
GitHub issues with those reports.

This repository is planned to move into [devantler-tech/.github](https://github.com/devantler-tech/.github)
as the organization governance source of truth. That migration is not complete; the tools and
workflows described here still live in this repository.

## Try the development checks

You need Git, Node.js 24 or later for the check tools, and [Bun](https://bun.sh/docs/installation).
CI uses the latest Bun release. From a new checkout:

```sh
git clone https://github.com/devantler-tech/maintenance.git
cd maintenance
bun install --frozen-lockfile
bun run ci
```

The command runs type checking, linting, formatting checks and fixture-based unit tests, then exits.
All checks should pass. This path needs no GitHub token or `.env` file, does not run an organization
report, and does not prove the scheduled reports are healthy. To make a change, follow
[Contributing](CONTRIBUTING.md).

## Reports for maintainers

| Report                         | What it finds                                                           | Configured schedule (UTC) |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------- |
| `repos-with-no-team`           | Non-archived repositories with no team assigned at any permission level | Wednesday, 09:00          |
| `repos-with-no-admin-team`     | Non-archived repositories without a team with admin permissions         | Tuesday, 09:00            |
| `repos-with-multi-admin-teams` | Repositories assigned more than one admin team                          | Monday, 09:00             |

Authenticated report runs are separate from development setup. See
[Running a report locally](CONTRIBUTING.md#running-a-report-locally-optional) for authorization,
organization selection, cached results and output handling. Schedules above describe the checked-in
[workflows](.github/workflows), not a claim that a particular run succeeded.

## Architecture

Reports follow a three-layer pattern:

1. **Entry point** (`src/reports/{name}.ts`) — executable script run via `bun run report:{name} [org]`. Org defaults to `devantler-tech`.
2. **Report logic** (`src/reports/{name}/`) — pure functions for violation detection and markdown rendering:
   - `find-violations.ts` — `(teams, repos) → violations[]` (no side effects)
   - `generate-markdown-report.ts` — `(violations) → string`
   - `find-violations.test.ts` — co-located unit tests
3. **Shared library** (`src/lib/`) — caching, GitHub API, output, logging. Import via `@lib/*` path alias.

Two orchestration patterns exist:

- **`runRepoViolationReport()`** — generic runner for reports that check repos against teams (used by `no-admin-team`, `no-team`)
- **Direct orchestration** — for reports with unique data flows (`multi-admin-teams`)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, CI checks, and how to add new reports.
