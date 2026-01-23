# Running GitHub Actions Locally with Act

This guide explains how to test GitHub Actions workflows locally using [act](https://github.com/nektos/act).

## Prerequisites

- Docker installed and running
  - Check if Docker is running: `docker ps`
  - If not running, start Docker Desktop or Docker daemon
- `act` tool installed (already installed via Homebrew)

## Quick Start

### 0. Check Docker is Running

Before running workflows, make sure Docker is running:

```bash
docker ps
```

If Docker is not running, start it first.

### 1. Test the Test Workflow

Run the test workflow locally:

```bash
act push -W .github/workflows/test.yml
```

Or use the helper script:

```bash
./scripts/test-workflow.sh test.yml
```

### 2. Test with Specific Job

Run only a specific job:

```bash
act push -W .github/workflows/test.yml -j test
```

### 3. List Available Workflows

See what workflows can be run:

```bash
act -l
```

## Configuration

### Secrets

If your workflow requires secrets, create a `.secrets` file (copy from `.secrets.example`):

```bash
cp .secrets.example .secrets
# Edit .secrets with your actual values
```

Then run with secrets:

```bash
act push -W .github/workflows/test.yml --secret-file .secrets
```

### Environment Variables

You can also pass environment variables directly:

```bash
act push -W .github/workflows/test.yml -e NODE_ENV=test
```

## Common Commands

### Run Test Workflow
```bash
# Using act directly
act push -W .github/workflows/test.yml

# Or using the helper script
./scripts/test-workflow.sh test.yml
```

### Run Deploy Test Workflow
```bash
act push -W .github/workflows/deploy-test.yml --secret-file .secrets
```

### Run with Verbose Output
```bash
act push -W .github/workflows/test.yml -v
```

### Dry Run (List steps without executing)
```bash
act push -W .github/workflows/test.yml --dryrun
```

### Use Specific Event
```bash
act workflow_dispatch -W .github/workflows/deploy-lambda.yml
```

## Limitations

- Some actions may not work perfectly in local Docker environment
- AWS deployments won't actually deploy (unless you configure AWS CLI locally)
- Codecov upload will be skipped in local runs
- Some platform-specific features may behave differently

## Troubleshooting

### Docker Issues
Make sure Docker is running:
```bash
docker ps
```

### Permission Issues
If you encounter permission issues, try:
```bash
act push -W .github/workflows/test.yml --container-options "--privileged"
```

### Cache Issues
Clear act cache if needed:
```bash
act cache rm
```

## More Information

- [act Documentation](https://github.com/nektos/act)
- [act Usage Examples](https://github.com/nektos/act#example-commands)
