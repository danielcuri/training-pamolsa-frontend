import type { BaseFieldProps, GenericObject } from 'vee-validate';
import type { OperationPriority, AreaWithProject } from './operation';

type FieldAttrs = BaseFieldProps & GenericObject;

export interface TemplateOperation {
    id: string;
    name: string;
    description?: string | null;
    priority: OperationPriority;
    weightPercent: number;
    order: number;
    areaOperationId: string;
    areaOperation?: AreaWithProject;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    rowIndex?: number;
}

export interface TemplateOperationForm {
    name: string | undefined;
    nameAttrs: FieldAttrs;
    description: string | undefined;
    descriptionAttrs: FieldAttrs;
    priority: OperationPriority | undefined;
    priorityAttrs: FieldAttrs;
    weightPercent: number | undefined;
    weightPercentAttrs: FieldAttrs;
    order: number | undefined;
    orderAttrs: FieldAttrs;
    areaOperationId: string | undefined;
    areaOperationIdAttrs: FieldAttrs;
    errors: Partial<
        Record<'name' | 'description' | 'priority' | 'weightPercent' | 'order' | 'areaOperationId', string | undefined>
    >;
}

export interface TemplateOperationUpsertPayload {
    name: string;
    description?: string;
    priority: OperationPriority;
    weightPercent: number;
    order: number;
    areaOperationId: string;
}

export interface TemplateOperationListData<TItem = TemplateOperation> {
    items: TItem[];
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
}

export interface TemplateOperationListParams {
    areaOperationId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    search?: string;
    cursor?: string;
    [key: string]: string | number | undefined;
}
