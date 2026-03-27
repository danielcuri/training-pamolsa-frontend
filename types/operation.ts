import type { BaseFieldProps, GenericObject } from 'vee-validate';

type FieldAttrs = BaseFieldProps & GenericObject;

// ============ ENUMS/STATUS ============
export enum OperationPriority {
    CRITICAL = 'CRITICAL',
    SEMI_CRITICAL = 'SEMI_CRITICAL',
    NON_CRITICAL = 'NON_CRITICAL',
}

export type OperationStatus = 'ACTIVE' | 'INACTIVE';

// ============ RELACIONES ANIDADAS ============
// Proyecto simplificado (dentro de area.project)
export interface ProjectMinimal {
    id: string;
    name: string;
}

// Área con su proyecto anidado (para listado de operaciones)
export interface AreaWithProject {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    projectId: string;
    project?: ProjectMinimal;
}

// ============ ENTIDAD PRINCIPAL ============
export interface Operation {
    id: string;
    name: string;
    description?: string;
    weightPercent?: number;
    priority: OperationPriority;
    status: OperationStatus;
    areaId: string; // ← FK para creación/actualización
    area?: AreaWithProject; // ← Objeto anidado en listados
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    rowIndex?: number; // ← Para el datatable
}

// ============ FORMULARIO ============
export interface OperationForm {
    name: string | undefined;
    nameAttrs: FieldAttrs;
    description: string | undefined;
    descriptionAttrs: FieldAttrs;
    priority: OperationPriority | undefined;
    priorityAttrs: FieldAttrs;
    weightPercent: number | undefined;
    weightPercentAttrs: FieldAttrs;
    status: OperationStatus | undefined;
    statusAttrs: FieldAttrs;
    areaId: string | undefined; // ← Seleccionado según proyecto
    areaIdAttrs: FieldAttrs;
    errors: Partial<Record<'name' | 'description' | 'priority' | 'weightPercent' | 'status' | 'areaId', string | undefined>>;
}

// ============ PAYLOADS API ============
// Para crear/actualizar (lo que envías al backend)
export interface OperationUpsertPayload {
    name: string;
    description?: string;
    priority: OperationPriority;
    weightPercent?: number;
    status?: OperationStatus;
    areaId: string; // ← Requerido por tu API
}

// ============ LISTADO/RESPUESTA ============
export interface OperationListData<TOperation = Operation> {
    items: TOperation[];
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
}

// ============ FILTROS/QUERY ============
export interface OperationListParams {
    page?: number;
    limit?: number;
    areaId?: string; // ← Filtrar operaciones por área
    projectId?: string; // ← Filtrar operaciones por proyecto (vía area)
    filter?: string; // JSON string: {"name__like":"termo"}
    [key: string]: string | number | undefined;
}

// ============ SELECTS ANIDADOS (para el formulario) ============
// Estado para manejar los selects en cascada
export interface OperationFormState {
    selectedProjectId: string; // ← Primero seleccionas proyecto
    availableAreas: AreaMinimal[]; // ← Luego se cargan las áreas de ese proyecto
}

// Área simplificada para el select (viene del endpoint de áreas filtrado por proyecto)
export interface AreaMinimal {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}
