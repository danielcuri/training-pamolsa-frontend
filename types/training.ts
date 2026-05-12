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

export interface TrainingMatrixTraining {
    id: string;
    startDate: string;
    status: TrainingStatus;
    result: TrainingResult;
    createdAt?: string;
    updatedAt?: string;
}

export interface TrainingMatrixCollaborator {
    id: string;
    name: string;
    email?: string | null;
    dni?: string | null;
    educationLevel?: string | null;
    hireDate?: string | null;
    role?: string;
    status?: string;
}

export interface TrainingMatrixTemplate {
    id: string;
    name: string;
    version: number;
    periodDurationDays: number;
    totalPeriods: number;
    minimumPassingScore: number;
    status?: string;
}

export interface TrainingMatrixProjectArea {
    id: string;
    name: string;
    status?: string;
}

export interface TrainingMatrixSummary {
    totalOperations: number;
    totalPeriods: number;
    minimumPassingScore: number;
}

export interface TrainingMatrixOperation {
    id: string;
    order: number;
    title: string;
    name: string;
    description: string;
    priority: string;
    weightPercent: number;
    minimumScore: number | null;
    status?: string;
    areaOperationId: string;
    cartilla: string | null;
}

export interface TrainingMatrixScore {
    operationId: string;
    logId: string | null;
    score: number | null;
    checklist: string | null;
    notes: string | null;
    evaluator: TrainingUserReference | string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface TrainingMatrixPeriod {
    id: string;
    periodNumber: number;
    title: string;
    startDate: string;
    endDate: string;
    evaluationDate: string | null;
    status: string;
    evaluator: TrainingUserReference | string | null;
    validationNotes: string | null;
    reinforcementNotes: string | null;
    qtyOperationTotal: number;
    qtyOperationStarted: number;
    scores: TrainingMatrixScore[];
}

export interface TrainingMatrixData {
    training: TrainingMatrixTraining;
    collaborator: TrainingMatrixCollaborator;
    template: TrainingMatrixTemplate;
    project: TrainingMatrixProjectArea;
    area: TrainingMatrixProjectArea;
    summary: TrainingMatrixSummary;
    operations: TrainingMatrixOperation[];
    periods: TrainingMatrixPeriod[];
}

export interface TrainingPeriodProgressScorePayload {
    templateOperationId: string;
    score: number;
    notes: string;
    checklist: string;
}

export interface TrainingPeriodProgressPayload {
    evaluationDate: string;
    evaluatorId: string;
    validationNotes: string;
    reinforcementNotes: string;
    scores: TrainingPeriodProgressScorePayload[];
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
