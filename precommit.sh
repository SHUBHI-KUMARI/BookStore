#!/bin/bash

# ==============================================================================
# Pre-commit Formatting and Lint Fix Script
# 
# Usage: 
# Run this script before committing your code, or run it and then commit:
# `./precommit.sh`
# ==============================================================================

echo "🔄 Changing to backend directory..."
cd backend || exit 1

echo "🎨 Running Prettier formatting..."
npm run format

echo "🧹 Running ESLint autofix..."
npm run lintfix

echo "✅ Formatting and Linting complete!"

echo "📦 Re-staging formatted files..."
cd ..

echo "🎉 Ready to commit!"
