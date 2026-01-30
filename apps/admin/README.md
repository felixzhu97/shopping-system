# Admin (Angular)

Minimal admin UI for the shopping system.

## Run

From repo root:

```bash
pnpm dev:admin
```

Then open `http://localhost:4200`.

## Login fields

- API Base URL: `http://localhost:3001` (the app will call `/api/*`)
- Admin Secret: must match backend `ADMIN_SECRET`
- Email or Phone + Password: any valid user credentials (returns JWT)

## Pages

- Products: list/create/delete
- Orders: list by status, update status
- Users: list
