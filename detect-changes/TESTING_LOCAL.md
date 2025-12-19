# Local Testing Guide

This directory contains test scripts to validate the `detect-changes` action locally before pushing to GitHub.

## Test Scripts

### `test-all.sh` - Comprehensive Test Suite
Runs all test scenarios to ensure the action works correctly:
- ✅ Manual module selection
- ✅ Auto-detection with empty manual modules
- ✅ Single module selection
- ✅ Modules with spaces (trimming)
- ✅ Duplicate module removal

**Usage:**
```bash
./test-all.sh
```

### `test-mock.sh` - Mock GitHub Actions Workflow
Simulates the exact validation that runs in the GitHub Actions workflow for manual module selection.

**Usage:**
```bash
./test-mock.sh
```

### `test-auto-detect.sh` - Auto-Detection Test
Tests the auto-detection scenario when no manual modules are specified.

**Usage:**
```bash
./test-auto-detect.sh
```

## Environment Setup

The action uses `.env.development` for local testing. You can modify this file to test different scenarios:

```bash
# .env.development
GITHUB_OUTPUT=tmp.out

# Example: Manual module selection
MANUAL_MODULES=api,web,mobile

# Example: Auto-detected modules
# Leave MANUAL_MODULES empty to test auto-detection
```

## Running Tests

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the action:
   ```bash
   pnpm run build
   ```

3. Run the test suite:
   ```bash
   ./test-all.sh
   ```

## Expected Output Format

The action outputs JSON arrays in the following format:

```json
{
  "deploy-modules": ["api", "web", "mobile"],
  "has-changes": "true"
}
```

### Valid Examples:
- `["api","web","mobile"]` - Multiple modules
- `["backend"]` - Single module
- `[]` - No modules (empty array)

### Invalid Examples (will cause jq errors):
- `[api,web,mobile]` - Missing quotes (Invalid JSON)
- `api,web,mobile` - Not an array
- `null` - Null value

## Troubleshooting

### Error: "jq: parse error: Invalid numeric literal"
This means the output is not valid JSON. Check that:
1. The action is running the bundled `dist/index.js` file
2. All dependencies (especially `dotenv`) are bundled correctly
3. The output includes proper quotes around strings

### Error: "Cannot find module 'dotenv'"
Run `pnpm install` to install dependencies, then `pnpm run build` to bundle them.

## CI/CD Integration

These tests complement the GitHub Actions workflow tests in `.github/workflows/test-detect-changes.yml`. Run these locally before pushing to catch issues early.
