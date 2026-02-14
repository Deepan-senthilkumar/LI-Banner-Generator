# Baseline Freeze

A baseline freeze creates a reproducible, auditable snapshot before large changes.

## What Gets Frozen
- Build health (`lint`, `test`, `build`)
- Environment metadata (Node/NPM versions)
- File integrity hashes for key directories
- Baseline manifest + command logs under `artifacts/baseline/<timestamp>/`

## Freeze Workflow
1. Ensure working tree is clean in your Git host.
2. Run:
   - `pwsh ./scripts/baseline-freeze.ps1 -Label "pre-release"` (PowerShell)
3. Verify all steps pass.
4. Commit docs/policy updates (if any).
5. Create and push a baseline tag in your Git host:
   - `baseline-<yyyy-mm-dd>` (example: `baseline-2026-02-14`)
6. Open release planning from this baseline.

## Output
Each run writes:
- `artifacts/baseline/<timestamp>/lint.log`
- `artifacts/baseline/<timestamp>/test.log`
- `artifacts/baseline/<timestamp>/build.log`
- `artifacts/baseline/<timestamp>/hashes.sha256.json`
- `artifacts/baseline/<timestamp>/manifest.json`

## Notes
- `git` metadata is included automatically when `git` is installed.
- If `git` is unavailable, freeze still runs and records non-git metadata.
