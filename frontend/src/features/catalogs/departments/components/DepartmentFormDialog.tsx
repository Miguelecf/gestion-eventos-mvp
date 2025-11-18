/**
 * ===================================================================
 * DEPARTMENT FORM DIALOG - Modal para crear/editar departamentos
 * ===================================================================
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { departmentSchema, type DepartmentFormData } from '@/schemas/department.schema';
import type { Department } from '@/services/api';

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  department?: Department | null;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  loading?: boolean;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  mode,
  department,
  onSubmit,
  loading = false,
}: DepartmentFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      colorHex: '#6B7280',
      active: true,
    },
  });

  const activeValue = watch('active');
  const colorValue = watch('colorHex');

  // Pre-cargar datos en modo edición
  useEffect(() => {
    if (mode === 'edit' && department) {
      reset({
        name: department.name,
        colorHex: department.colorHex || '#6B7280',
        active: department.active,
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        colorHex: '#6B7280',
        active: true,
      });
    }
  }, [mode, department, reset]);

  const handleFormSubmit = async (data: DepartmentFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    if (isDirty && !confirm('¿Descartar cambios sin guardar?')) {
      return;
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === 'create' ? 'Nuevo departamento' : 'Editar departamento'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Investigación y Desarrollo"
              aria-invalid={!!errors.name}
              disabled={loading}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Color Hex */}
          <div className="space-y-2">
            <Label htmlFor="colorHex">Color identificador</Label>
            <div className="flex gap-3 items-center">
              <Controller
                name="colorHex"
                control={control}
                render={({ field }) => (
                  <input
                    type="color"
                    value={field.value || '#6B7280'}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setValue('colorHex', e.target.value, { shouldDirty: true });
                    }}
                    disabled={loading}
                    className="h-10 w-16 rounded border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              />
              <Input
                id="colorHex"
                placeholder="#6B7280"
                value={colorValue || ''}
                onChange={(e) => setValue('colorHex', e.target.value, { shouldDirty: true })}
                disabled={loading}
                className="flex-1 font-mono"
                aria-invalid={!!errors.colorHex}
              />
            </div>
            {errors.colorHex && (
              <p className="text-sm text-destructive">{errors.colorHex.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Selecciona un color con el selector o ingresa un código hexadecimal (ej: #FF5733)
            </p>
          </div>

          {/* Switch Activo */}
          <div className="space-y-2">
            <Label htmlFor="active">Estado</Label>
            <div className="flex items-center gap-3 h-10">
              <Switch
                id="active"
                checked={activeValue}
                onCheckedChange={(checked) => setValue('active', checked, { shouldDirty: true })}
                disabled={loading}
              />
              <span className="text-sm text-muted-foreground">
                {activeValue ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {activeValue 
                ? 'El departamento estará disponible para selección en formularios'
                : 'El departamento no aparecerá en formularios de eventos'
              }
            </p>
          </div>

          {/* Botones */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !isDirty}>
              {loading ? 'Guardando...' : mode === 'create' ? 'Crear departamento' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
