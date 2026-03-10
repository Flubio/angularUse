# AngularUse

Collection of Angular-first utilities and state helpers, inspired by the developer experience of VueUse.

## Why this project

Angular has powerful primitives (Signals, DI, RxJS), but many apps repeatedly implement similar utility patterns. AngularUse aims to provide reusable, tree-shakeable helpers with strong TypeScript support and a clean API.

## Inspiration and credit

This project is **inspired by [VueUse](https://github.com/vueuse/vueuse/tree/main)** and its excellent model for ergonomic utility composition.

Huge credit to the VueUse maintainers and contributors for setting a high bar for API design, docs quality, and open-source stewardship.

## Current status

- Early-stage library
- Core state utilities in progress
- APIs may evolve before stable release

## Package(s)

- `ngx-use` — Angular utility library

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Install dependencies

```bash
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## Project structure

```text
projects/
	ngx-use/
		src/
			lib/
				core/
					state/
					di/
```

## Roadmap

- [x] Scaffold library workspace
- [x] Add `createGlobalState`
- [x] Add `createProvidedState` (with `createInjectionState` compatibility alias)
- [x] Add `createSharedState`
- [x] Add `useAsyncState`
- [x] Add strongly typed DI token helper (`createTypedToken`)
- [ ] Add additional state and browser utilities
- [ ] Improve API docs and examples
- [ ] Stabilize v1 surface

## Contributing

Contributions are welcome. Please start with [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Quick flow:

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Open a pull request

## Acknowledgements

- [VueUse](https://github.com/vueuse/vueuse/tree/main) — primary inspiration
- Angular team and ecosystem maintainers

## License

This project is licensed under the [MIT License](./LICENSE).

Please also review our [Code of Conduct](./CODE_OF_CONDUCT.md).
