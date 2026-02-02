# Mobile app (Expo)

React Native mobile app for the shopping system. Built with Expo and Expo Router.

## Requirements

- Node.js >= 20
- PNPM
- Expo Go (optional) or an emulator/simulator

## Install

From the repository root:

```bash
pnpm install
```

## Run

From the repository root:

```bash
pnpm dev:mobile
```

Or from this directory:

```bash
pnpm start
pnpm ios
pnpm android
pnpm web
```

## Configuration

Runtime config lives in `src/constants/config.ts`.

## Notes

- Routes are file-based under the `app/` directory (Expo Router).
- For shared types and utilities, see workspace packages `types` and `utils`.
