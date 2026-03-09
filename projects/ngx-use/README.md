# ngx-use

Angular utility collection focused on composable, typed, and reusable patterns.

## Inspiration and credit

`ngx-use` is inspired by **[VueUse](https://github.com/vueuse/vueuse/tree/main)**.

This project borrows the spirit of small, focused utility APIs and a composition-first developer experience. Full credit to the VueUse team and contributors for the inspiration.

## Features (current)

- Global state utility: `createGlobalState`
- Angular DI-friendly implementation
- TypeScript-first APIs

## Installation

```bash
pnpm add ngx-use
```

> Package publication is still in progress. Until published, consume from this repository source.

## Usage

```ts
import { inject } from '@angular/core';
import { CreateGlobalState } from 'ngx-use';

const createGlobalState = inject(CreateGlobalState);

const useCounterState = createGlobalState.create(() => {
   let count = 0;
   return {
      get count() {
         return count;
      },
      inc() {
         count += 1;
      },
   };
});

const counter = useCounterState();
counter.inc();
```

## API

### `CreateGlobalState`

Service that memoizes state factory output globally after first invocation.

## Local development

From the workspace root:

```bash
pnpm install
pnpm build
pnpm test
```

## Publishing (when ready)

```bash
cd dist/ngx-use
npm publish
```

## Contributing

Issues and PRs are welcome. Please read the contribution guide first:

- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md)

## License

Licensed under the [MIT License](../../LICENSE).
