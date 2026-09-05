# Native Resource administration contract

The private backend package is consumed at an exact approved revision:

```json
{
  "dependencies": {
    "sistema-garfex": "git+https://github.com/GARFEX33/sistema-garfex.git#<BACKEND_COMMIT_WITH_CLASS_FAMILY_FILTERS>"
  }
}
```

Replace the placeholder with the delivered backend commit that contains this contract. Do not keep an older revision: generated argument types are revision-specific.

Use the generated API and native Convex React hooks directly; no Resource DTO or pagination adapter is needed:

```tsx
import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import { api } from "sistema-garfex/convex-api";
import type { Id } from "sistema-garfex/convex-data-model";
import type { AdminErrorData } from "sistema-garfex/catalog-admin-errors";

const page = usePaginatedQuery(
  api.catalogoAdmin.recursos.buscarRecursosResumen,
  { searchText, lifecycle: "ACTIVE", familiaRecursoId, scope: { kind: "ALL" } },
  { initialNumItems: 25 },
);
page.results;
page.status;
page.loadMore(25);

const detail = useQuery(api.catalogoAdmin.recursos.obtenerDetalleRecurso, { recursoId });
const create = useMutation(api.catalogoAdmin.recursos.crearRecurso);
const update = useMutation(api.catalogoAdmin.recursos.actualizarRecurso);
const activate = useMutation(api.catalogoAdmin.recursos.activarRecurso);
const deactivate = useMutation(api.catalogoAdmin.recursos.desactivarRecurso);
```

`listarRecursosResumen` uses the same native `usePaginatedQuery` shape; for example, pass `{ claseRecursoId, lifecycle: "ACTIVE", scope: { kind: "GLOBAL" } }`. The generated imports above are the consumer contract: do not import Convex implementation files or create DTOs.

`tipoRecursoId`, `claseRecursoId`, and `familiaRecursoId` are optional hierarchy selectors, but exactly one may be supplied in a request. Omit all three to browse every hierarchy. Supplying two or three fails with `ADMIN_INVALID_ARGUMENT` and `context.field === "classification"`.

Native cursors, accumulated results, status, reactivity, and reset behavior belong to Convex. Traverse with `usePaginatedQuery` and `page.loadMore(n)`; do not retain, transform, or fabricate continuation cursors. Search order is Convex native relevance order, not a client-side sort. Never fetch a page and post-filter it by Class or Family: that loses matching rows beyond the page boundary and creates gaps or duplicates during cursor traversal. Handle failures through `AdminErrorData.code` and its discriminated `context`, never message prose. Legacy `catalogoRecursos.recursos` and existing catalog-admin pagination remain unchanged.

Run `pnpm typecheck:consumer` to check the standalone generated contract without importing backend implementation modules or executing functions.
