import type { BaseFieldProps, GenericObject } from 'vee-validate';

type FieldAttrs = BaseFieldProps & GenericObject;

export type TrainingTemplateStatus = 'ACTIVE' | 'INACTIVE';

export interface TrainingTemplateProjectReference {
    id: string;
    name: string;
    status?: string;
}

export interface TrainingTemplateAreaReference {
    id: string;
    name: string;
    status?: string;
    projectId?: string;
    project?: TrainingTemplateProjectReference;
}

export interface TrainingTemplateItem {
    id: string;
    name: string;
    version: number;
    periodDurationDays: number;
    totalPeriods: number;
    minimumPassingScore: number;
    certificateTemplatePdf: string | null;
    status: TrainingTemplateStatus;
    areaId: string;
    projectId: string;
    area?: TrainingTemplateAreaReference;
    project?: TrainingTemplateProjectReference;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    rowIndex?: number;
}

export interface TrainingTemplateForm {
    name: string | undefined;
    nameAttrs: FieldAttrs;
    version: number | undefined;
    versionAttrs: FieldAttrs;
    periodDurationDays: number | undefined;
    periodDurationDaysAttrs: FieldAttrs;
    totalPeriods: number | undefined;
    totalPeriodsAttrs: FieldAttrs;
    minimumPassingScore: number | undefined;
    minimumPassingScoreAttrs: FieldAttrs;
    certificateTemplatePdf: string | undefined;
    certificateTemplatePdfAttrs: FieldAttrs;
    status: TrainingTemplateStatus | undefined;
    statusAttrs: FieldAttrs;
    projectId: string | undefined;
    projectIdAttrs: FieldAttrs;
    areaId: string | undefined;
    areaIdAttrs: FieldAttrs;
    errors: Partial<
        Record<
            | 'name'
            | 'version'
            | 'periodDurationDays'
            | 'totalPeriods'
            | 'minimumPassingScore'
            | 'certificateTemplatePdf'
            | 'status'
            | 'projectId'
            | 'areaId',
            string | undefined
        >
    >;
}

export interface TrainingTemplateUpsertPayload {
    name: string;
    version: number;
    periodDurationDays: number;
    totalPeriods: number;
    minimumPassingScore: number;
    certificateTemplatePdf: string;
    status: TrainingTemplateStatus;
    areaId: string;
    projectId: string;
}

export interface TrainingTemplateListData<TItem = TrainingTemplateItem> {
    items: TItem[];
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
}

export interface TrainingTemplateListParams {
    page?: number;
    limit?: number;
    projectId?: string;
    areaId?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    cursor?: string;
    [key: string]: unknown;
}
