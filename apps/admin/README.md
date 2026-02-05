# Admin (Angular)

Minimal admin UI for the shopping system.

## Run

From repo root:

```bash
pnpm dev:admin
```

Then open `http://localhost:4200`.

## Environment

For local development, copy `.env.example` to `.env` in this folder and adjust values:

```bash
cp apps/admin/.env.example apps/admin/.env
```

Supported variables:

- `VITE_API_BASE_URL`: base URL for the backend API (default: `http://localhost:3001/api`)

## Login fields

- Email or Phone + Password: any valid user credentials (returns JWT)

The API base URL and admin secret are handled by the server and admin app automatically.

## Pages

- Products: list/create/delete
- Orders: list by status, update status
- Users: list
- Meeting: join WebRTC room, video, chat, TTS/STT, live subtitles (CC). Translation (MyMemory API): separate language selects for subtitles and chat; subtitles and chat messages can be translated to multiple target languages.
