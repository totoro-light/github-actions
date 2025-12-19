#!/bin/bash

set -e  # Exit on error

echo "========================================"
echo "Testing detect-changes action"
echo "========================================"
echo ""

# Test 1: Manual modules
echo "TEST 1: Manual module selection"
echo "----------------------------------------"
export MANUAL_MODULES="api,web,mobile"
export GITHUB_OUTPUT="/tmp/github_output_test1.txt"
> "$GITHUB_OUTPUT"

node index.js > /dev/null 2>&1

HAS_CHANGES=$(grep "^has-changes=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)
MODULES=$(grep "^deploy-modules=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)

echo "Has changes: $HAS_CHANGES"
echo "Modules: $MODULES"

# Validate
if [ "$HAS_CHANGES" != "true" ]; then
  echo "❌ FAILED: Expected has-changes=true"
  exit 1
fi

if ! echo "$MODULES" | jq -e 'index("api")' > /dev/null 2>&1; then
  echo "❌ FAILED: Expected 'api' in modules"
  exit 1
fi

if ! echo "$MODULES" | jq -e 'index("web")' > /dev/null 2>&1; then
  echo "❌ FAILED: Expected 'web' in modules"
  exit 1
fi

if ! echo "$MODULES" | jq -e 'index("mobile")' > /dev/null 2>&1; then
  echo "❌ FAILED: Expected 'mobile' in modules"
  exit 1
fi

echo "✅ PASSED: Manual module selection works correctly"
echo ""

# Test 2: Empty manual modules (should trigger auto-detect)
echo "TEST 2: Auto-detection (empty manual modules)"
echo "----------------------------------------"
export MANUAL_MODULES=""
export GITHUB_OUTPUT="/tmp/github_output_test2.txt"
> "$GITHUB_OUTPUT"

node index.js > /dev/null 2>&1

HAS_CHANGES=$(grep "^has-changes=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)
MODULES=$(grep "^deploy-modules=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)

echo "Has changes: $HAS_CHANGES"
echo "Modules: $MODULES"

# Validate JSON format
if ! echo "$MODULES" | jq empty 2>/dev/null; then
  echo "❌ FAILED: Invalid JSON format"
  exit 1
fi

echo "✅ PASSED: Auto-detection produces valid JSON"
echo ""

# Test 3: Single module
echo "TEST 3: Single module selection"
echo "----------------------------------------"
export MANUAL_MODULES="backend"
export GITHUB_OUTPUT="/tmp/github_output_test3.txt"
> "$GITHUB_OUTPUT"

node index.js > /dev/null 2>&1

HAS_CHANGES=$(grep "^has-changes=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)
MODULES=$(grep "^deploy-modules=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)

echo "Has changes: $HAS_CHANGES"
echo "Modules: $MODULES"

if ! echo "$MODULES" | jq -e 'index("backend")' > /dev/null 2>&1; then
  echo "❌ FAILED: Expected 'backend' in modules"
  exit 1
fi

MODULE_COUNT=$(echo "$MODULES" | jq 'length')
if [ "$MODULE_COUNT" != "1" ]; then
  echo "❌ FAILED: Expected exactly 1 module, got $MODULE_COUNT"
  exit 1
fi

echo "✅ PASSED: Single module selection works correctly"
echo ""

# Test 4: Modules with spaces (should be trimmed)
echo "TEST 4: Modules with spaces"
echo "----------------------------------------"
export MANUAL_MODULES=" api , web , mobile "
export GITHUB_OUTPUT="/tmp/github_output_test4.txt"
> "$GITHUB_OUTPUT"

node index.js > /dev/null 2>&1

MODULES=$(grep "^deploy-modules=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)
echo "Modules: $MODULES"

if ! echo "$MODULES" | jq -e 'index("api")' > /dev/null 2>&1; then
  echo "❌ FAILED: Expected 'api' in modules (spaces should be trimmed)"
  exit 1
fi

echo "✅ PASSED: Spaces are trimmed correctly"
echo ""

# Test 5: Duplicate modules (should be deduplicated)
echo "TEST 5: Duplicate modules"
echo "----------------------------------------"
export MANUAL_MODULES="api,web,api,mobile,web"
export GITHUB_OUTPUT="/tmp/github_output_test5.txt"
> "$GITHUB_OUTPUT"

node index.js > /dev/null 2>&1

MODULES=$(grep "^deploy-modules=" "$GITHUB_OUTPUT" | cut -d'=' -f2-)
echo "Modules: $MODULES"

MODULE_COUNT=$(echo "$MODULES" | jq 'length')
if [ "$MODULE_COUNT" != "3" ]; then
  echo "❌ FAILED: Expected 3 unique modules, got $MODULE_COUNT"
  exit 1
fi

echo "✅ PASSED: Duplicates are removed correctly"
echo ""

echo "========================================"
echo "All tests passed! ✅"
echo "========================================"
