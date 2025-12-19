# Detect Changed Modules Action

A GitHub Action that detects changed modules in a monorepo by analyzing git diffs, or uses manually specified modules.

## Features

- 🔍 Auto-detects changed modules by comparing git commits
- 📦 Supports manual module selection
- 🎯 Filters changes to `apps/` directory
- 📤 Outputs JSON array for matrix strategy
- ✨ Works with monorepo structures

## Usage

### Basic Usage (Auto-detection)

```yaml
- name: Detect changed modules
  id: detect
  uses: ./detect-changes
  
- name: Use the outputs
  run: |
    echo "Modules to deploy: ${{ steps.detect.outputs.deploy-modules }}"
    echo "Has changes: ${{ steps.detect.outputs.has-changes }}"
```

### Manual Module Selection

```yaml
- name: Detect changed modules
  id: detect
  uses: ./detect-changes
  with:
    manual_modules: 'api,web,mobile'
```

### Custom Directory Structure

```yaml
# For root-level modules (module1/, module2/, etc.)
- name: Detect changed modules
  id: detect
  uses: ./detect-changes
  with:
    modules_directory: ''

# For packages/ directory (packages/core, packages/utils, etc.)
- name: Detect changed modules
  id: detect
  uses: ./detect-changes
  with:
    modules_directory: 'packages/'
```

### With Matrix Strategy

```yaml
jobs:
  detect:
    runs-on: ubuntu-latest
    outputs:
      deploy-modules: ${{ steps.detect.outputs.deploy-modules }}
      has-changes: ${{ steps.detect.outputs.has-changes }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Need at least 2 commits for comparison
      
      - name: Detect changed modules
        id: detect
        uses: ./detect-changes
  
  deploy:
    needs: detect
    if: needs.detect.outputs.has-changes == 'true'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        module: ${{ fromJson(needs.detect.outputs.deploy-modules) }}
    steps:
      - name: Deploy ${{ matrix.module }}
        run: echo "Deploying ${{ matrix.module }}"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `manual_modules` | Comma-separated list of modules to deploy (overrides auto-detection) | No | `''` |
| `modules_directory` | Directory prefix to filter changed files. Use `apps/` for `apps/module1`, or `''` (empty) for root-level `module1/` | No | `apps/` |

## Outputs

| Output | Description |
|--------|-------------|
| `deploy-modules` | JSON array of modules that need to be deployed |
| `has-changes` | Whether there are any modules to deploy (`true`/`false`) |

## How It Works

1. **Manual Mode**: If `manual_modules` is provided, it uses those modules
2. **Auto-detection Mode**: Compares `HEAD~1` and `HEAD` to find changed files
3. Filters files in the specified directory (default: `apps/`)
4. Extracts unique module names based on directory structure:
   - **Root level** (`modules_directory: ''`): `module1/file.js` → `module1`
   - **Subdirectory** (`modules_directory: 'apps/'`): `apps/api/file.js` → `api`
   - **Custom path** (`modules_directory: 'packages/'`): `packages/core/file.js` → `core`
5. Outputs as JSON array for use in matrix strategies

### Examples

| File Path | `modules_directory` | Detected Module |
|-----------|---------------------|-----------------|
| `module1/src/index.js` | `''` (empty) | `module1` |
| `api/utils/helper.js` | `''` (empty) | `api` |
| `apps/web/index.js` | `apps/` | `web` |
| `apps/api/server.js` | `apps/` | `api` |
| `packages/core/lib.js` | `packages/` | `core` |

## Development

### Local Testing

Copy the example environment file and customize it:

```sh
cp .env.example .env
# Edit .env with your test values
```

Example `.env` file:

```env
GITHUB_OUTPUT=tmp.out
MANUAL_MODULES=api,web,mobile
```

Run locally:

```sh
npm install
npm run dev
```

### Building

The action uses Rollup to compile all dependencies into a single file:

```sh
npm run build
```

This creates `dist/index.js` which is the entry point for the GitHub Action.

### Scripts

- `npm run dev` - Run the script locally with `.env` file
- `npm run build` - Compile the action to `dist/index.js`
- `npm start` - Run the compiled version from `dist/`
