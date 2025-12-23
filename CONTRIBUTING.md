# Contributing to OmniDesk

Thanks for your interest in contributing! Follow these steps to get started.

## Getting Set Up
- Install Node.js 18 or newer and npm.
- Fork the repo and create a feature branch from `main`.
- Install dependencies: `npm install`.

## Development Workflow
- Run the dev server during changes: `npm run dev`.
- Keep code formatted and clean by running `npm run lint`.
- Before opening a PR, ensure the project builds: `npm run build`.

## Pull Requests
- Use a clear title and short description of the change.
- Keep PRs focused and small when possible.
- Include screenshots or notes for UI changes.
- Link any related issues if applicable.

## Coding Guidelines
- TypeScript for new code; prefer existing patterns in `src/context/AppContext.tsx` and `src/pages/`.
- Keep components small and composable; lift shared logic into hooks or context where appropriate.
- Add brief comments only when intent is not obvious.

## Reporting Issues
- Describe the problem, expected behavior, and reproduction steps.
- Include browser/OS info and console errors when relevant.

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
