# Native Resource administration contract

The private backend package is consumed at an exact approved revision:

```json
{
  "dependencies": {
    "sistema-garfex": "git+https://github.com/GARFEX33/sistema-garfex.git#ee560ea4904f81bae46a700d0157ddaa93a35192"
  }
}
```

Use the generated API and native Convex React hooks directly; no Resource DTO or pagination adapter is needed:

```tsx
import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import { api } from "sistema-garfex/convex-api";
import type { Id } from "sistema-garfex/convex-data-model";
import type { AdminErrorData } from "sistema-garfex/catalog-admin-errors";

const page = usePaginatedQuery(
  api.catalogoAdmin.recursos.buscarRecursosResumen,
  { searchText, lifecycle: "ACTIVE", tipoRecursoId, scope: { kind: "ALL" } },
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

`listarRecursosResumen` uses the same native `usePaginatedQuery` shape. Native cursors, accumulated results, status, reactivity, and reset behavior belong to Convex. Search order is Convex native relevance order, not a client-side sort. Handle failures through `AdminErrorData.code` and its discriminated `context`, never message prose. Legacy `catalogoRecursos.recursos` and existing catalog-admin pagination remain unchanged.

Run `pnpm typecheck:consumer` to check the standalone generated contract without importing backend implementation modules or executing functions.
