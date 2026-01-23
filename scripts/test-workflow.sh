#!/bin/bash

# Script to test GitHub Actions workflows locally using act
# Usage: ./scripts/test-workflow.sh [workflow-name] [job-name]

set -e

WORKFLOW="${1:-test.yml}"
JOB="${2:-}"

WORKFLOW_PATH=".github/workflows/${WORKFLOW}"

if [ ! -f "$WORKFLOW_PATH" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_PATH"
    echo "Available workflows:"
    ls -1 .github/workflows/*.yml
    exit 1
fi

echo "🚀 Testing workflow: $WORKFLOW"
echo "📄 Workflow file: $WORKFLOW_PATH"

if [ -f ".secrets" ]; then
    echo "🔐 Using secrets from .secrets file"
    SECRETS_FLAG="--secret-file .secrets"
else
    echo "⚠️  No .secrets file found. Some steps may fail if they require secrets."
    echo "   Create .secrets from .secrets.example if needed."
    SECRETS_FLAG=""
fi

if [ -n "$JOB" ]; then
    echo "🎯 Running specific job: $JOB"
    act push -W "$WORKFLOW_PATH" -j "$JOB" $SECRETS_FLAG
else
    echo "🔄 Running all jobs in workflow"
    act push -W "$WORKFLOW_PATH" $SECRETS_FLAG
fi
