export type TrainingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type TrainingResult = 'PASSED' | 'FAILED';

export interface TrainingUpsertPayload {
    userId: string;
    templateId: string;
    startDate: string;
    status: TrainingStatus;
    result: TrainingResult;
}

export interface TrainingUserOption {
    id: string;
    name: string;
    email?: string | null;
}

export interface TrainingTemplateOption {
    id: string;
    name: string;
    version?: number;
}

export interface TrainingListParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    search?: string;
    cursor?: string;
    userId?: string;
    templateId?: string;
    status?: TrainingStatus | '';
    result?: TrainingResult | '';
    [key: string]: unknown;
}

export interface TrainingListData<TItem = TrainingItem> {
    items: TItem[];
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
}

export interface TrainingUserReference {
    id: string;
    name: string;
    email?: string | null;
}

export interface TrainingTemplateReference {
    id: string;
    name: string;
    version?: number;
}

export interface TrainingItem {
    id: string;
    userId: string;
    templateId: string;
    startDate: string;
    status: TrainingStatus;
    result: TrainingResult;
    user?: TrainingUserReference;
    template?: TrainingTemplateReference;
    createdAt?: string;
    updatedAt?: string;
    rowIndex?: number;
}
