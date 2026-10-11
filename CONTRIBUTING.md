# Contributing

Documentation corrections and focused regression tests are useful first contributions. Discuss a
substantial change in an [issue](https://github.com/devantler-tech/maintenance/issues) before starting,
especially new reports: this repository is planned to migrate into
[devantler-tech/.github](https://github.com/devantler-tech/.github).
Report sensitive vulnerabilities through
[private reporting](https://github.com/devantler-tech/maintenance/security/advisories/new), never a
public issue or PR. Do not include credentials or private organization data in examples.

## Make a first change

Install Git, [Bun](https://bun.sh/docs/installation), and Node.js compatible with the locked check
tools. ESLint currently accepts Node.js 20.19+ within 20.x, 22.13+ within 22.x, or 24 and later;
the repository itself does not pin Node.js. CI uses the latest Bun release.
Fork the repository on GitHub. Replace `YOUR-LOGIN` with your login,
then run:

```sh
git clone https://github.com/YOUR-LOGIN/maintenance.git
cd maintenance
git switch -c docs/first-contribution
bun install --frozen-lockfile
```

Make a small wording correction in `README.md`, or add a synthetic case to an existing
`find-violations.test.ts`. Keep reusable functions in `src/lib/` and report-specific logic in
`src/reports/{report-name}/`. The test helpers in `src/test/helpers.ts` create synthetic teams and
repositories; no organization access is needed.

From the repository root, run:

```sh
bun run ci
git diff --check
```

Both commands should exit successfully. `bun run ci` runs type checking, linting, formatting and
unit tests in sequence. It needs no `.env`, GitHub token, publishing access or organization report.
Tests write disposable local fixtures and coverage; they do not query your organization.
For formatting changes, use `bun run format:fix` and inspect the resulting diff before rerunning CI.

You can run individual checks while developing:

```bash
bun run typecheck       # TypeScript type checking
bun run lint            # ESLint
bun run format:check    # Prettier (check only)
bun test                # Tests with coverage
```

The [CI workflow](.github/workflows/ci.yml) also prepares lockfile/formatting patches for same-repository
PRs and aggregates its required checks. Local unit tests are not proof that report workflows or
their credentials work.

## Submit the change

Review your diff, stage only your changed paths, configure commit signing, and use a Conventional
Commit subject. For the README example:

```sh
git add README.md
git commit -S -m "docs: clarify the local check path"
git push -u origin docs/first-contribution
```

Open a **draft** PR from your fork's branch to `devantler-tech/maintenance:main`. Use the supplied PR
template, explain the reader problem and outcome, and link the issue for substantial work. Record
which checks actually ran, disclose AI assistance when used, and respond to review findings. Native
CI and a substantive review of the exact current head must pass before merge. Follow the
[organization code of conduct](https://github.com/devantler-tech/.github/blob/main/.github/CODE_OF_CONDUCT.md)
and preserve attribution for any third-party material you change.

## Running a report locally (optional)

This is an operator task, not a contribution prerequisite. Run reports only for an organization you
are authorized to inspect. After installing dependencies, supply an appropriately authorized
`GH_TOKEN` or `GITHUB_TOKEN` through your environment or an ignored `.env` file based on
[`.env.example`](.env.example). Never commit the token or print it in a report.

Replace `YOUR-ORG` with that organization's slug. From the repository root:

```sh
bun run report:repos-with-no-team YOUR-ORG
bun run report:repos-with-no-admin-team YOUR-ORG
bun run report:repos-with-multi-admin-teams YOUR-ORG
```

Omitting the argument selects `devantler-tech`; do not rely on that default for an unrelated
organization. Each command writes a dated `report-*.md` file and exits. Local CLI runs do not create
GitHub issues; the scheduled workflows perform that separate write. Reports and cached API data may
contain private organization information: keep them out of public issues, commits and attachments.
If `GITHUB_OUTPUT` is set, the CLI also appends report metadata to that file; leave it unset for
ordinary local runs.
The ignored `.cache/` directory has no automatic expiry; move aside only this checkout's report
cache before a run that requires fresh data. Keep or remove your local generated reports according
to your organization's data-handling rules.

## Adding a new report

1. Create a new directory `src/reports/{report-name}/` for report-specific logic
2. Create the main report script at `src/reports/{report-name}.ts`
3. Add tests in `src/reports/{report-name}/find-violations.test.ts` — use `makeTeam`/`makeRepo` from `@test/helpers`
4. Add `"report:{name}": "bun run src/reports/{name}.ts"` to `package.json`
5. Add a workflow in `.github/workflows/report-{name}.yml` following the existing pattern
