import type { BaseFieldProps, GenericObject } from 'vee-validate';

type FieldAttrs = BaseFieldProps & GenericObject;

// ============ ENUMS/STATUS ============
export type ProjectApiStatus = 'ACTIVE' | 'INACTIVE';

// ============ FORMULARIO ============
export interface ProjectForm {
    name: string | undefined;
    nameAttrs: FieldAttrs;
    status: ProjectApiStatus | undefined;
    statusAttrs: FieldAttrs;
    errors: Partial<Record<'name' | 'status', string | undefined>>;
}

// ============ ENTIDAD PRINCIPAL ============
export interface Project {
    id: string;
    name: string;
    status: ProjectApiStatus;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    rowIndex?: number;
}

// ============ LISTADO/RESPUESTA ============
export interface ProjectListData<TProject = Project> {
    items: TProject[];
    page?: number;
    limit?: number;
    total?: number;
    // El backend puede devolver otras llaves (ej: `data`, `meta`, `totalItems`, etc.)
    [key: string]: unknown;
}
// ============ PAYLOADS API ============
// Para crear/actualizar (lo que envías al backend)
export type ProjectUpsertPayload = {
    name: string;
    status: ProjectApiStatus;
};
