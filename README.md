# Shopping System Monorepo

Monorepo for a shopping system built with Turborepo and PNPM. It includes web and mobile clients, backend services, and shared packages.

## Requirements

- Node.js >= 20
- PNPM (see `package.json` `packageManager`)
- MongoDB (for the API service)

## Quick start

Install all dependencies:

```bash
pnpm install
```

Start development (all workspaces):

```bash
pnpm dev
```

Common scoped dev commands:

```bash
pnpm dev:web
pnpm dev:api
pnpm dev:admin
pnpm dev:mobile
pnpm dev:api-web
pnpm dev:web:storybook
```

## Common commands

```bash
pnpm build
pnpm test
pnpm lint
pnpm lint:fix
pnpm format
pnpm clean
```

Seed sample data (via `packages/scripts`):

```bash
pnpm seed:api
```

## Project structure

```
shopping-system/
├── apps/        # user-facing apps (web, mobile, admin, cli)
├── services/    # backend services (api, crawler, data-mining)
├── packages/    # shared packages (types, utils, components, ...)
├── docs/        # documentation (api, architecture, development, devops)
└── scripts/     # repository scripts
```

## Documentation

- API docs: `docs/api/api-documentation.md`
- OpenAPI spec: `docs/api/openapi.json`
- Postman collection: `docs/api/postman_collection.json`
- Architecture diagrams (C4 / TOGAF): `docs/architecture/`
- Environment setup: `docs/development/ENVIRONMENT.md`
- Onboarding: `docs/development/onboarding-guide.md`
- Testing guide: `docs/development/testing-guide.md`

## Services and apps

- Web app: `apps/web`
- Mobile app: `apps/mobile`
- Admin app: `apps/admin`
- API service: `services/api` (see `services/api/README.md` for env vars and endpoints)

## Contributing

- Create a branch from `main` (e.g. `feat/...`, `fix/...`, `docs/...`)
- Keep changes focused and update docs when behavior changes
- Use Conventional Commits for commit messages

## License

MIT
