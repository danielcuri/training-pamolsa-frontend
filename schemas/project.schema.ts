// schemas/project.schema.ts
import { z } from 'zod';

export const projectSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres'),
    status: z.enum(['ACTIVE', 'INACTIVE'], {
        errorMap: () => ({ message: 'El status debe ser ACTIVE o INACTIVE' }),
    }),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
