import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCatalogsStore } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import type { Space, CreateSpaceInput } from '@/services/api';

const spaceSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  capacity: z.number().min(0, 'La capacidad debe ser positiva').int('Debe ser un número entero'),
  location: z.string().min(1, 'La ubicación es obligatoria').max(200, 'Máximo 200 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato inválido (ej: #3498db)')
    .optional(),
  defaultBufferBeforeMin: z
    .number()
    .min(0, 'Debe ser positivo')
    .max(120, 'Máximo 120 minutos')
    .int('Debe ser un número entero'),
  defaultBufferAfterMin: z
    .number()
    .min(0, 'Debe ser positivo')
    .max(120, 'Máximo 120 minutos')
    .int('Debe ser un número entero'),
  active: z.boolean().optional(),
});

type SpaceFormData = z.infer<typeof spaceSchema>;

interface SpaceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  space?: Space;
}

export function SpaceFormDialog({ open, onOpenChange, mode, space }: SpaceFormDialogProps) {
  const { createSpace, updateSpace, loading, errors } = useCatalogsStore();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<SpaceFormData>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      name: '',
      capacity: 30,
      location: '',
      description: '',
      colorHex: '#6B7280',
      defaultBufferBeforeMin: 30,
      defaultBufferAfterMin: 30,
      active: true,
    },
  });

  const activeValue = watch('active');

  // Prellenar formulario en modo edición
  useEffect(() => {
    if (mode === 'edit' && space) {
      reset({
        name: space.name,
        capacity: space.capacity,
        location: space.location,
        description: space.description || '',
        colorHex: space.colorHex || '#6B7280',
        defaultBufferBeforeMin: space.defaultBufferBeforeMin,
        defaultBufferAfterMin: space.defaultBufferAfterMin,
        active: space.active,
      });
    } else {
      reset({
        name: '',
        capacity: 30,
        location: '',
        description: '',
        colorHex: '#6B7280',
        defaultBufferBeforeMin: 30,
        defaultBufferAfterMin: 30,
        active: true,
      });
    }
  }, [mode, space, reset]);

  const onSubmit = async (data: SpaceFormData) => {
    try {
      if (mode === 'create') {
        const input: CreateSpaceInput = {
          name: data.name,
          capacity: data.capacity,
          location: data.location,
          description: data.description,
          colorHex: data.colorHex || '#6B7280',
          defaultBufferBeforeMin: data.defaultBufferBeforeMin,
          defaultBufferAfterMin: data.defaultBufferAfterMin,
          active: data.active ?? true,
        };

        const result = await createSpace(input);

        if (result) {
          toast.success('✅ Espacio creado correctamente');
          onOpenChange(false);
          reset();
        } else {
          toast.error(errors.createSpace || 'Error al crear el espacio');
        }
      } else if (mode === 'edit' && space) {
        const result = await updateSpace(space.id, data);

        if (result) {
          toast.success('✅ Espacio actualizado correctamente');
          onOpenChange(false);
        } else {
          toast.error(errors.updateSpace || 'Error al actualizar el espacio');
        }
      }
    } catch (error) {
      console.error('Error en formulario:', error);
      toast.error('Error inesperado al guardar');
    }
  };

  const isLoading = loading.createSpace || loading.updateSpace;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo Espacio' : 'Editar Espacio'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Crea un nuevo espacio físico para eventos'
              : 'Modifica los datos del espacio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid de 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ej: Aula Magna"
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name.message}</p>
              )}
            </div>

            {/* Capacidad */}
            <div className="space-y-2">
              <Label htmlFor="capacity">
                Capacidad (personas) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                min={0}
                step={1}
                aria-invalid={!!formErrors.capacity}
              />
              {formErrors.capacity && (
                <p className="text-sm text-destructive">{formErrors.capacity.message}</p>
              )}
            </div>

            {/* Ubicación */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">
                Ubicación <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ej: Edificio Central – Planta Baja"
                aria-invalid={!!formErrors.location}
              />
              {formErrors.location && (
                <p className="text-sm text-destructive">{formErrors.location.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                placeholder="Características adicionales del espacio..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
              />
              {formErrors.description && (
                <p className="text-sm text-destructive">{formErrors.description.message}</p>
              )}
            </div>

            {/* Color Identificador */}
            <div className="space-y-2">
              <Label htmlFor="colorHex">Color Identificador</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register('colorHex')}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  id="colorHex"
                  {...register('colorHex')}
                  placeholder="#6B7280"
                  className="flex-1"
                  aria-invalid={!!formErrors.colorHex}
                />
              </div>
              {formErrors.colorHex && (
                <p className="text-sm text-destructive">{formErrors.colorHex.message}</p>
              )}
            </div>

            {/* Switch Activo */}
            <div className="space-y-2">
              <Label htmlFor="active">Estado</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  id="active"
                  checked={activeValue}
                  onCheckedChange={(checked) => setValue('active', checked, { shouldDirty: true })}
                />
                <span className="text-sm text-muted-foreground">
                  {activeValue ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Buffer Antes */}
            <div className="space-y-2">
              <Label htmlFor="defaultBufferBeforeMin">
                Buffer Antes (minutos) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="defaultBufferBeforeMin"
                type="number"
                {...register('defaultBufferBeforeMin', { valueAsNumber: true })}
                min={0}
                max={120}
                step={5}
                aria-invalid={!!formErrors.defaultBufferBeforeMin}
              />
              {formErrors.defaultBufferBeforeMin && (
                <p className="text-sm text-destructive">
                  {formErrors.defaultBufferBeforeMin.message}
                </p>
              )}
            </div>

            {/* Buffer Después */}
            <div className="space-y-2">
              <Label htmlFor="defaultBufferAfterMin">
                Buffer Después (minutos) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="defaultBufferAfterMin"
                type="number"
                {...register('defaultBufferAfterMin', { valueAsNumber: true })}
                min={0}
                max={120}
                step={5}
                aria-invalid={!!formErrors.defaultBufferAfterMin}
              />
              {formErrors.defaultBufferAfterMin && (
                <p className="text-sm text-destructive">
                  {formErrors.defaultBufferAfterMin.message}
                </p>
              )}
            </div>
          </div>

          {/* Errores del backend */}
          {(errors.createSpace || errors.updateSpace) && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {errors.createSpace || errors.updateSpace}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !isDirty}>
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
