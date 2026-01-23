# Version Management

This document describes the unified version management strategy for Node.js and pnpm across the project.

## Current Versions

- **Node.js**: `20` (specified in `.nvmrc` and `package.json` engines)
- **pnpm**: `10.1.0` (specified in `package.json` engines and packageManager)

## Version Sources

The project uses a single source of truth approach:

1. **`.nvmrc`**: Defines the Node.js version for local development
2. **`package.json`**:
   - `engines.node`: `>=20.0.0`
   - `engines.pnpm`: `^10.1.0`
   - `packageManager`: `pnpm@10.1.0`
3. **GitHub Actions Workflows**: Use environment variables defined at the top of each workflow file:
   - `NODE_VERSION: '20'`
   - `PNPM_VERSION: '10.1.0'`

## Updating Versions

When updating versions, ensure consistency across all locations:

1. Update `.nvmrc` with the new Node.js version
2. Update `package.json`:
   - `engines.node`
   - `engines.pnpm`
   - `packageManager`
3. Update all GitHub Actions workflow files (`.github/workflows/*.yml`):
   - Update `NODE_VERSION` in the `env` section
   - Update `PNPM_VERSION` in the `env` section

## Workflow Files

All workflow files define versions at the top using environment variables:

```yaml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '10.1.0'
```

These variables are then referenced throughout the workflow:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}

- name: Setup PNPM
  uses: pnpm/action-setup@v2
  with:
    version: ${{ env.PNPM_VERSION }}
```

This ensures a single point of change when versions need to be updated.

## Lockfile Compatibility

The project uses `pnpm-lock.yaml` with lockfile version `6.0`, which is compatible with pnpm 7+.

**Important**: 
- The lockfile must be generated using pnpm 10.1.0 (or compatible version)
- If you see "incompatible lockfile" errors in CI, ensure:
  1. The lockfile is committed to the repository
  2. The pnpm version in CI matches the version used to generate the lockfile
  3. Run `pnpm install` locally to regenerate the lockfile if needed

## CI/CD Configuration

All workflows include:
- Version verification step to confirm pnpm version
- Lockfile existence check before installation
- pnpm store caching for faster builds
- `package_json_file` configuration to ensure version consistency

If lockfile issues persist:
1. Verify `pnpm-lock.yaml` is committed to the repository
2. Check that the lockfile format matches the pnpm version
3. Regenerate the lockfile locally: `pnpm install`
4. Commit the updated lockfile
