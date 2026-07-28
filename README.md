# CivicBuild Frontend

## Project Overview

CivicBuild-Frontend is the Expo-based mobile and web frontend for the CivicBuild platform. It provides a React Native client for community users to browse services, place orders, manage profiles, and interact with local providers through the CivicBuild marketplace.

## What this repo contains

- Expo app built with React Native and TypeScript.
- Navigation powered by React Navigation.
- API integration using Axios and React Query.
- Form handling with React Hook Form and schema validation using Zod.
- Styling via NativeWind and Tailwind CSS.
- Environment-based configuration for API URLs, OAuth, and EAS settings.

## Requirements

- Node.js 20+ (or a supported LTS release)
- npm 10+ or Yarn 4+
- Expo CLI installed globally if you want to use `expo` commands directly:

```bash
npm install -g expo-cli
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file to a local env file:

```bash
cp .env.example .env
```

3. Update `.env` with your backend URL and Expo environment values.

4. Start the app locally:

```bash
npm run start
```

## Running

- `npm run start` — launch Expo in LAN mode.
- `npm run start:clear` — launch Expo with cache cleared.
- `npm run start:tunnel` — start Expo with a tunnel (requires ngrok).
- `npm run android` — open the Android app.
- `npm run ios` — open the iOS app.
- `npm run web` — run the app in the browser.

## Scripts

- `npm run lint` — run ESLint on `.ts` and `.tsx` files.
- `npm run lint:fix` — auto-fix lint issues.
- `npm run format` — format source files with Prettier.
- `npm run typecheck` — run TypeScript type checking.
- `npm run test` — run Jest tests.
- `npm run test:watch` — run Jest in watch mode.
- `npm run test:coverage` — generate test coverage.

## Environment

The repository includes `.env.example` with the variables this app expects. Copy it to `.env` and configure values for your local or production environment.

Important values:

- `EXPO_PUBLIC_API_URL` — backend API base URL.
- `EXPO_PUBLIC_APP_ENV` — environment name, such as `development` or `production`.
- `EXPO_PUBLIC_PROJECT_ID` — EAS project ID if using Expo Application Services.
- `EXPO_PUBLIC_EXPO_OWNER` — Expo owner username.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google OAuth web client ID.

> Do not commit real secrets or production credentials to the repo. `.env` should stay local.

## Project Configuration

The Expo configuration is defined in `app.config.ts`.

- App slug: `civicbuild`
- Android package: `com.civicbuild.app`
- iOS bundle ID: `com.civicbuild.app`
- Web bundler: `metro`

## Notes

- This repo is private and intended for local development and deployment through Expo/EAS.
- Use the `.env.example` file as a template and never store real API keys or OAuth secrets in source control.
