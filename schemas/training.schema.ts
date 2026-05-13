import { z } from 'zod';

export const trainingSchema = z.object({
    userId: z.string().min(1, 'Selecciona un usuario'),
    templateId: z.string().min(1, 'Selecciona un template'),
    startDate: z.string().min(1, 'Selecciona una fecha de inicio'),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
        required_error: 'Selecciona un estado',
    }),
    result: z.enum(['PASSED', 'FAILED'], {
        required_error: 'Selecciona un resultado',
    }),
});
