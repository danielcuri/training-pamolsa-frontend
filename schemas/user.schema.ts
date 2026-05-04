import { z } from 'zod';

const optionalUuid = z.union([z.literal(''), z.string().uuid('El valor seleccionado no es válido')]);

export const userSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres'),
    email: z
        .string()
        .min(1, 'El correo es obligatorio')
        .email('Ingresa un correo válido'),
    dni: z
        .string()
        .trim()
        .min(1, 'El DNI es obligatorio')
        .regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos'),
    password: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || value.length >= 6, 'La contraseña debe tener al menos 6 caracteres'),
    educationLevel: z
        .string()
        .trim()
        .min(1, 'El nivel de educación es obligatorio')
        .max(100, 'El nivel de educación no puede superar 100 caracteres'),
    hireDate: z.string().min(1, 'La fecha de ingreso es obligatoria'),
    role: z.enum(['ADMIN', 'COLLABORATOR', 'SUPERVISOR', 'SUPERADMIN'], {
        errorMap: () => ({ message: 'Debes seleccionar un rol válido' }),
    }),
    status: z.enum(['ACTIVE', 'INACTIVE'], {
        errorMap: () => ({ message: 'Debes seleccionar un estado válido' }),
    }),
    projectId: optionalUuid,
    areaId: optionalUuid,
});

export type UserFormValues = z.infer<typeof userSchema>;
