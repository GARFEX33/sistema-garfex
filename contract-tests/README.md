# Catalog administration contract

The separate React consumer imports the backend's generated contract; it does not copy DTOs or run backend code. Because this repository is private, pin the backend repository to the approved W16 commit (or an equivalent private-registry version):

```json
{
  "dependencies": {
    "sistema-garfex": "git+https://github.com/GARFEX33/sistema-garfex.git#<approved-w16-commit-sha>"
  }
}
```

Use the exported generated references and data model directly:

```ts
import { api } from "sistema-garfex/convex-api";
import type { Id } from "sistema-garfex/convex-data-model";
import type { AdminErrorData } from "sistema-garfex/catalog-admin-errors";
```

The consumer creates its own `ConvexReactClient` with its deployment URL. Contract updates change Convex validators/functions here, run `pnpm exec convex codegen --typecheck enable`, publish a new pinned backend version, and then bump that pin in the React repository. `pnpm typecheck:consumer` checks the standalone fixture without executing backend functions.
