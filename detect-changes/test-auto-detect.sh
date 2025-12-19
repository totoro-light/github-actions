#!/bin/bash

# Mock the auto-detect scenario
echo "=== Mocking auto-detect scenario ==="

# Simulate what the action outputs for auto-detection
export GITHUB_OUTPUT="/tmp/github_output_auto.txt"
export MODULES_DIRECTORY="apps/"

# Clear the mock output file
> "$GITHUB_OUTPUT"

# Create a mock git repo if needed
if [ ! -d .git ]; then
  echo "Note: Not in a git repo, auto-detection may not work as expected"
fi

# Run the action (without MANUAL_MODULES, so it auto-detects)
echo "Running detect-changes action in auto-detect mode..."
unset MANUAL_MODULES
node index.js

# Read the outputs
echo ""
echo "=== GitHub Action Outputs ==="
cat "$GITHUB_OUTPUT"

# Parse the outputs
HAS_CHANGES=$(grep "^has-changes=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)
MODULES=$(grep "^deploy-modules=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)

echo ""
echo "=== Parsed Values ==="
echo "HAS_CHANGES: $HAS_CHANGES"
echo "MODULES: $MODULES"

# Validate JSON format
echo ""
echo "=== Validating JSON Format ==="
if echo "$MODULES" | jq empty 2>/dev/null; then
  echo "✅ Valid JSON format"
  echo "Modules array:"
  echo "$MODULES" | jq -r '.[]' 2>/dev/null || echo "(empty array)"
else
  echo "❌ Invalid JSON format"
  exit 1
fi

echo ""
echo "=== Test Complete ==="
