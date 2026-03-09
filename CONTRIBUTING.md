# Contributing to AngularUse

Thanks for your interest in contributing! 🎉

We welcome bug reports, feature ideas, docs improvements, and pull requests.

## Ground rules

- Be respectful and collaborative
- Keep pull requests focused and reasonably small
- Include tests for behavior changes
- Update docs when APIs change

## Development setup

1. Install dependencies:
   - `pnpm install`
2. Build the workspace:
   - `pnpm build`
3. Run tests:
   - `pnpm test`

## Project layout

- `projects/ngx-use/src/lib` — library source
- `projects/ngx-use/src/public-api.ts` — exported public API

## Pull request checklist

Before opening a PR, please ensure:

- [ ] Code builds successfully
- [ ] Tests pass
- [ ] New behavior is tested
- [ ] Public API changes are intentional
- [ ] README/API docs are updated (if needed)

## Commit guidance

Use clear, descriptive commit messages. Conventional commits are appreciated but not required.

Examples:
- `feat(state): add createGlobalState utility`
- `fix(state): avoid re-initializing cached state`
- `docs(readme): add usage example for createGlobalState`

## Reporting issues

When filing an issue, include:

- What you expected
- What actually happened
- Steps to reproduce
- Environment details (Node, pnpm, Angular version)

## Questions

Open a discussion in issues with the `question` label and we’ll help you out.

Thanks again for helping improve AngularUse 💚
