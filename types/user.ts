import type { BaseFieldProps, GenericObject } from 'vee-validate';

type FieldAttrs = BaseFieldProps & GenericObject;

export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type UserRole = 'ADMIN' | 'COLLABORATOR' | 'SUPERVISOR' | 'SUPERADMIN';

export interface UserProjectReference {
    id: string;
    name: string;
    status?: string;
}

export interface UserAreaReference {
    id: string;
    name: string;
    status?: string;
    projectId?: string;
}

export interface UserItem {
    id: string;
    name: string;
    email: string;
    dni: string | null;
    educationLevel: string | null;
    hireDate: string | null;
    role: string;
    status: UserStatus;
    projectId: string | null;
    areaId: string | null;
    project?: UserProjectReference;
    area?: UserAreaReference;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    rowIndex?: number;
}

export interface UserForm {
    name: string | undefined;
    nameAttrs: FieldAttrs;
    email: string | undefined;
    emailAttrs: FieldAttrs;
    dni: string | undefined;
    dniAttrs: FieldAttrs;
    password: string | undefined;
    passwordAttrs: FieldAttrs;
    educationLevel: string | undefined;
    educationLevelAttrs: FieldAttrs;
    hireDate: string | undefined;
    hireDateAttrs: FieldAttrs;
    role: UserRole | undefined;
    roleAttrs: FieldAttrs;
    status: UserStatus | undefined;
    statusAttrs: FieldAttrs;
    projectId: string | undefined;
    projectIdAttrs: FieldAttrs;
    areaId: string | undefined;
    areaIdAttrs: FieldAttrs;
    errors: Partial<Record<'name' | 'email' | 'dni' | 'password' | 'educationLevel' | 'hireDate' | 'role' | 'status' | 'projectId' | 'areaId', string | undefined>>;
}

export interface UserUpsertPayload {
    name: string;
    email: string;
    dni: string | null;
    password?: string;
    educationLevel: string | null;
    hireDate: string;
    role: UserRole;
    status: UserStatus;
    projectId: string | null;
    areaId: string | null;
}

export interface UserListData<TUser = UserItem> {
    items: TUser[];
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
}

export interface UserListParams {
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
