/**
 * ===================================================================
 * DEPARTMENT SCHEMA - Validación con Zod
 * ===================================================================
 * Esquema de validación para formularios de Departamentos
 * ===================================================================
 */

import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  
  colorHex: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato inválido. Debe ser #RRGGBB (ej: #FF5733)')
    .optional()
    .or(z.literal('')),
  
  active: z.boolean().optional(),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
