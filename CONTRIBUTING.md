# Contributing

The project is designed to be extensible. Reusable functions are placed in `lib/` so they can be used by multiple scripts. Report-specific logic goes in `reports/{report-name}/`.

## Running a report locally

1. Copy `.env.example` to `.env` and set `GH_TOKEN` to a fine-grained personal access token with `members` org scope and `metadata` repo scope.
2. Run a report:

```bash
bun run report:repos-with-no-team [org]
bun run report:repos-with-no-admin-team [org]
bun run report:repos-with-multi-admin-teams [org]
```

The `[org]` argument defaults to `devantler-tech` if omitted. API responses are cached in `.cache/` to speed up repeated runs during development — delete the directory to force a refresh.

## CI checks

Run all CI checks locally before pushing:

```bash
bun run ci
```

This runs type checking, linting (ESLint), formatting (Prettier), and tests in sequence. You can also run them individually:

```bash
bun run typecheck       # TypeScript type checking
bun run lint            # ESLint
bun run format:check    # Prettier (check only)
bun test                # Tests with coverage
```

## Adding a new report

1. Create a new directory `reports/{report-name}/` for report-specific logic
2. Create the main report script at `reports/{report-name}.ts`
3. Add tests in `reports/{report-name}/find-violations.test.ts` — use `makeTeam`/`makeRepo` from `@test/helpers`
4. Add `"report:{name}": "bun run reports/{name}.ts"` to `package.json`
5. Add a workflow in `.github/workflows/report-{name}.yml` following the existing pattern
