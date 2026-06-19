# maintenance

CLI tools for GitHub organization maintenance — generating governance reports that run on cron schedules and surface violations as GitHub issues.

## Architecture

Reports follow a strict three-layer pattern:

1. **Entry point** (`src/reports/{name}.ts`) — executable script run via `bun run report:{name} [org]`. Org defaults to `devantler-tech`.
2. **Report logic** (`src/reports/{name}/`) — pure functions for violation detection and markdown rendering:
   - `find-violations.ts` — `(teams, repos) → violations[]` (no side effects)
   - `generate-markdown-report.ts` — `(violations) → string`
   - `find-violations.test.ts` — co-located unit tests
3. **Shared library** (`src/lib/`) — caching, GitHub API, output, logging. Import via `@lib/*` path alias.

Two orchestration patterns exist:

- **`runRepoViolationReport()`** — generic runner for reports that check repos against teams (used by `no-admin-team`, `no-team`)
- **Direct orchestration** — for reports with unique data flows (`multi-admin-teams`)

## Essential Commands

```bash
bun run ci                                    # Full CI: typecheck → lint → format → test
bun run report:repos-with-no-team             # Run a report locally (requires GH_TOKEN in .env or .env.local)
bun test                                      # Tests with coverage (enabled in bunfig.toml)
```

CI runs `tsc --noEmit`, `eslint .` (type-checked rules), `prettier --check .`, and `bun test` in sequence.

## Key Conventions

- **All logging goes to stderr** — `info()`, `debug()`, `warn()` from `@lib/log`. Stdout is reserved for report content piping.
- **Default exports** for the primary function of each module; `import type` for types (enforced by `verbatimModuleSyntax`).
- **JSDoc** on all exported functions with `@param` and `@returns`.
- **Kebab-case** filenames everywhere. Test files co-located as `{name}.test.ts`.
- **Atomic file writes** — `fetchWithCache` writes to a `.tmp` file then renames, preventing partial reads.

## Testing Patterns

Tests use Bun's built-in runner (`bun:test`). Shared test factories in `src/test/helpers.ts`:

- `makeTeam({ name, slug, ... })` — Team fixture with empty defaults for members/repos/permissions
- `makeRepo({ name, ... })` — OrgRepo fixture with auto-generated URL, `"private"` visibility
- `describeRepoViolationBehavior(findViolations, options?)` — registers shared test cases (sorting, metadata preservation) and optionally parameterized happy-path/detection tests via `{ permissionLevel, coveredLabel, violationLabel }`

Report-specific tests only cover behavior unique to that report. Shared behavior lives in the helper.

## Caching

`fetchWithCache<T>(key, fetchFn)` stores API responses as `.cache/{key}.json`. Locally, these files are reused across runs (no TTL — delete `.cache/` to refresh). In CI, each run starts from a clean workspace.

## Workflows

Report workflows (`.github/workflows/report-*.yml`) follow an identical structure: cron trigger → checkout → setup-bun → install → get GitHub App token via `actions/create-github-app-token` → run report → create/update issue via `peter-evans/create-issue-from-file`.

The CI workflow (`ci.yml`) runs on PRs/pushes.

## Adding a New Report

1. Create `src/reports/{name}/find-violations.ts` (pure function) and `generate-markdown-report.ts`
2. Create `src/reports/{name}.ts` entry point — use `runRepoViolationReport()` if the report checks repos against teams
3. Add tests in `src/reports/{name}/find-violations.test.ts` — use `makeTeam`/`makeRepo` from `@test/helpers`
4. Add `"report:{name}": "bun run src/reports/{name}.ts"` to `package.json`
5. Add a workflow in `.github/workflows/report-{name}.yml` following the existing pattern
