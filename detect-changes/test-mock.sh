#!/bin/bash

# Mock the test-manual-modules outputs
echo "=== Mocking test-manual-modules outputs ==="

# Simulate what the action outputs
export MANUAL_MODULES="api,web,mobile"
export GITHUB_OUTPUT="/tmp/github_output_mock.txt"

# Clear the mock output file
> "$GITHUB_OUTPUT"

# Run the action
echo "Running detect-changes action..."
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

# Now run the validation like in the workflow
echo ""
echo "=== Running Validation ==="
echo "Validating manual selection outputs..."

# Manual selection should always have changes
if [ "$HAS_CHANGES" != "true" ]; then
  echo "❌ Manual selection should have has-changes=true, got: $HAS_CHANGES"
  exit 1
fi

# Check expected modules are present
if ! echo "$MODULES" | jq -e 'index("api")' > /dev/null; then
  echo "❌ Expected 'api' in modules: $MODULES"
  exit 1
fi

if ! echo "$MODULES" | jq -e 'index("web")' > /dev/null; then
  echo "❌ Expected 'web' in modules: $MODULES"
  exit 1
fi

if ! echo "$MODULES" | jq -e 'index("mobile")' > /dev/null; then
  echo "❌ Expected 'mobile' in modules: $MODULES"
  exit 1
fi

echo "✅ Manual selection outputs are valid"
echo ""
echo "=== Test Complete ==="
