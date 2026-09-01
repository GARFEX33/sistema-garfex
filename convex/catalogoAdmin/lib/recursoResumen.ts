import type { Doc } from "../../_generated/dataModel";
import { resolverJerarquiaEfectiva, type RazonEfectividad } from "../../../src/catalogoRecursos/dominio/catalogoEfectivo";
import type { ResourceClassificationStatus, ResourceSummary } from "../resourceValidators";

export type ResourceDoc = Doc<"recursos">;

export function resourceClassificationStatus(input: {
  classId?: string;
  familyId?: string;
  typeId?: string;
  familyClassId?: string;
  typeFamilyId?: string;
  classActive?: boolean;
  familyActive?: boolean;
  typeActive?: boolean;
}): ResourceClassificationStatus {
  const hierarchy = resolverJerarquiaEfectiva(input);
  const state = hierarchy.reasons.includes("MISSING_REFERENCE") || hierarchy.reasons.includes("HIERARCHY_INVALID")
    ? "BROKEN_REFERENCE"
    : hierarchy.effective ? "EFFECTIVE" : "INERT";
  return { state, reasons: hierarchy.reasons };
}

export function projectResourceSummary(
  resource: ResourceDoc,
  classificationStatus: ResourceClassificationStatus,
): ResourceSummary {
  return {
    id: resource._id,
    identificadorTecnico: resource.identificadorTecnico,
    nombre: resource.nombre,
    tipoRecursoId: resource.tipoRecursoId,
    unidadId: resource.unidadId,
    ...(resource.organizacionId === undefined ? {} : { organizacionId: resource.organizacionId }),
    activo: resource.activo,
    revision: resource.revision,
    classificationStatus,
  };
}

export function classificationStatusFromReferences(
  resource: Pick<ResourceDoc, "tipoRecursoId">,
  references: { type: Pick<Doc<"tiposRecurso">, "_id" | "familiaRecursoId" | "activo"> | null; family: Pick<Doc<"familiasRecurso">, "_id" | "claseRecursoId" | "activo"> | null; clazz: Pick<Doc<"clasesRecurso">, "_id" | "activo"> | null },
): ResourceClassificationStatus {
  return resourceClassificationStatus({
    classId: references.clazz?._id,
    familyId: references.family?._id,
    typeId: references.type?._id,
    familyClassId: references.family?.claseRecursoId,
    typeFamilyId: references.type?.familiaRecursoId,
    classActive: references.clazz?.activo,
    familyActive: references.family?.activo,
    typeActive: references.type?.activo,
  });
}

export type { RazonEfectividad };
