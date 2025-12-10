# Develop Devops Scripts
- We use simple shell scripts to wrap common devops tasks.
- We don't provide scripts when a popular native command exists.
- Locations: `scripts/`, `packages/*/scripts/` with conventional expressive names.
- Style: minimal arguments, `--help`, fail fast, forward popular commands' error messages, idempotent when sensible.
- We don't use Makefiles/Justfiles due to their whitespace sensitivity and friction. We don't use package.json scripts except to call bash scripts or one-liners.
- During development: syntax checks, dry-runs, manual test runs with inspection of outputs and side effects, document test steps in script comments.
- Documentation: comment header, why-comments in code, usage-level instructions in onboarding docs.