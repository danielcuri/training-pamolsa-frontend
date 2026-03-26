import type { BaseFieldProps, GenericObject } from 'vee-validate';

type FieldAttrs = BaseFieldProps & GenericObject;

// ============ ENUMS/STATUS ============
export type AreaApiStatus = 'ACTIVE' | 'INACTIVE';

// ============ RELACIONES ============
// Proyecto simplificado (solo lo necesario para mostrar en listado)
export interface ProjectReference {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

// ============ ENTIDAD PRINCIPAL ============
export interface Area {
    id: string;
    name: string;
    status: AreaApiStatus;
    projectId: string; // ← FK para creación/actualización
    project?: ProjectReference; // ← Objeto anidado en listados
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    rowIndex?: number; // ← Para el datatable
}

// ============ FORMULARIO ============
export interface AreaForm {
    name: string | undefined;
    nameAttrs: FieldAttrs;
    status: AreaApiStatus | undefined;
    statusAttrs: FieldAttrs;
    projectId: string | undefined; // ← Nuevo: necesario para el form
    projectIdAttrs: FieldAttrs; // ← Nuevo: atributos del select
    errors: Partial<Record<'name' | 'status' | 'projectId', string | undefined>>;
}

// ============ PAYLOADS API ============
// Para crear/actualizar (lo que envías al backend)
export interface AreaUpsertPayload {
    name: string;
    status: AreaApiStatus;
    projectId: string; // ← Requerido por tu API
}

// ============ LISTADO/RESPUESTA ============
export interface AreaListData<TArea = Area> {
    items: TArea[];
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
}

// ============ FILTROS/QUERY ============
export interface AreaListParams {
    page?: number;
    limit?: number;
    projectId?: string;
    filter?: string;
    [key: string]: unknown;
}
