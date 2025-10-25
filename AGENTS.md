# Repository Guidelines

## Project Structure & Module Organization
Keep runtime code in `src/`, separated by concern: CLI workflows under `src/cli/`, Note API adapters in `src/core/note-api/`, markdown transforms in `src/core/markdown/`, authentication helpers in `src/core/auth/`, and shared utilities in `src/shared/`. Data persistence lives in `src/data/` with repositories abstracted from storage backends. The Next.js app sits in `src/web/` (`app/`, `components/`, `server/`). Place integration fixtures in `/data` and user-facing documentation in `/docs`. Tests should mirror the source layout inside `/tests` for fast discovery.

## Build, Test, and Development Commands
Run `pnpm install` once to sync workspace dependencies. Use `pnpm dev` to launch the Next.js development server and rebuild the CLI in watch mode. Execute `pnpm build` for a production-ready Next.js bundle plus compiled CLI artifacts. Lint and format via `pnpm lint` (Biome lint rules) and `pnpm fmt` before opening a pull request. When tests are available, run `pnpm test` for Vitest suites; add `--watch` to iterate locally.

## Coding Style & Naming Conventions
TypeScript files use 2-space indentation and explicit return types for exported functions. Prefer `camelCase` for functions and variables, `PascalCase` for React components and classes, and `SCREAMING_SNAKE_CASE` for environment constants. Keep modules small and cohesive—business logic belongs in `src/core/`, framework glue in `src/web/` or `src/cli/`. Run Biome (`pnpm lint`) to enforce import order, unused symbol pruning, and consistent JSX spacing before committing.

## Testing Guidelines
Author Vitest unit tests mirroring the module path inside `/tests` (e.g., `tests/core/markdown/markdown-to-html.test.ts`). For React UI, combine Vitest with Testing Library utilities to validate user flows. Snapshot output for CLI commands when it aids regression safety. Aim for most new features to ship with meaningful coverage; add skip markers only with a TODO referencing a tracking issue. Run `pnpm test --coverage` when touching critical data or authentication paths.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`) to ease automated changelog generation. Squash trivial “wip” history before review. Pull requests should include: a concise summary, linked requirement or issue, screenshots or CLI output for UI/UX changes, and a checklist of commands run (`pnpm lint`, `pnpm test`). Request reviews from domain owners for `src/core/` changes and from UI owners for `src/web/`. Ensure all TODOs are either resolved or tracked before merging.

## Security & Configuration Tips
Store Note cookies and API secrets in `.env.local` (never commit). Limit Note API calls to documented rate limits and reuse repository abstractions for credential storage. Scrub logs of personal data before attaching them to issues, and update dependency lockfiles promptly when security advisories mention Puppeteer or Markdown tooling.
