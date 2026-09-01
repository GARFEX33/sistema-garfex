import type { Id, TableNames } from "../../../convex/_generated/dataModel";

/** Creates branded Convex IDs for tests without weakening production types. */
export function fakeId<Table extends TableNames>(value: string): Id<Table> {
  return value as Id<Table>;
}
