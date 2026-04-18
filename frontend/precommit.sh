#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# Make sure we're in the frontend directory
cd "$(dirname "$0")"

echo "======================================"
echo "🚀 Starting Frontend Pre-commit Checks"
echo "======================================"

echo ""
echo "✨ 1. Formatting Code with Prettier..."
npx prettier --write "src/**/*.{ts,tsx,css,json,md}"

echo ""
echo "🧹 2. Running ESLint with Fix..."
# Use node_modules/.bin/eslint directly or npm run
npm run lint -- --fix

echo ""
echo "📝 3. Type Checking TypeScript..."
# Use tsc -b to respect Vite's tsconfig project references
npx tsc -b

echo ""
echo "✅ All frontend pre-commit checks passed successfully!"
echo "======================================"
