# maintenance

CLI tools for GitHub organization maintenance — generating governance reports that run on cron schedules and surface violations as GitHub issues.

## Architecture

Reports follow a three-layer pattern:

1. **Entry point** (`reports/{name}.ts`) — executable script run via `bun run report:{name} [org]`. Org defaults to `devantler-tech`.
2. **Report logic** (`reports/{name}/`) — pure functions for violation detection and markdown rendering:
   - `find-violations.ts` — `(teams, repos) → violations[]` (no side effects)
   - `generate-markdown-report.ts` — `(violations) → string`
   - `find-violations.test.ts` — co-located unit tests
3. **Shared library** (`lib/`) — caching, GitHub API, output, logging. Import via `@lib/*` path alias.

Two orchestration patterns exist:

- **`runRepoViolationReport()`** — generic runner for reports that check repos against teams (used by `no-admin-team`, `no-team`)
- **Direct orchestration** — for reports with unique data flows (`multi-admin-teams`)

## Reports

### Repos with No Team

Detects non-archived repositories that have no team assigned at any permission level.

```bash
bun run report:repos-with-no-team [org]
```

**Schedule:** Every Wednesday at 09:00 UTC

### Repos with No Admin Team

Detects non-archived repositories that have no team with admin permissions.

```bash
bun run report:repos-with-no-admin-team [org]
```

**Schedule:** Every Tuesday at 09:00 UTC

### Repos with Multi Admin Teams

Detects repositories that have more than one team with admin permissions. Each repository should have exactly one admin team.

```bash
bun run report:repos-with-multi-admin-teams [org]
```

**Schedule:** Every Monday at 09:00 UTC

## Requirements

The `GH_TOKEN` or `GITHUB_TOKEN` environment variable must be set to a fine-grained GitHub personal access token with `members` org scope and `metadata` repo scope. This can be done by creating a `.env` file (see `.env.example`).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, CI checks, and how to add new reports.
