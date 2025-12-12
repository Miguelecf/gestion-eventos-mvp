/**
 * ===================================================================
 * VERIFICADOR DE DISPONIBILIDAD
 * ===================================================================
 * Muestra el resultado de la verificación de disponibilidad del espacio.
 * Indica si el horario está disponible o si hay conflictos.
 * ===================================================================
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AvailabilityResult } from '@/services/api';

export interface AvailabilityCheckerProps {
  availability: AvailabilityResult | null;
  isChecking?: boolean;
  onRecheck?: () => void;
}

export function AvailabilityChecker({
  availability,
  isChecking,
  onRecheck,
}: AvailabilityCheckerProps) {
  // No mostrar nada si no hay resultado
  if (!availability && !isChecking) {
    return null;
  }

  // Estado de verificación
  if (isChecking) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span className="text-sm font-medium">Verificando disponibilidad...</span>
        </div>
      </Card>
    );
  }

  // Sin resultado
  if (!availability) {
    return null;
  }

  const { available, conflicts, message } = availability;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header con estado */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {available ? (
              <>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    ✓ Horario Disponible
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {message || 'El espacio está libre para el horario seleccionado'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                    ✗ Conflicto Detectado
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {message || `Hay ${conflicts.length} evento(s) que ocupan el espacio en ese horario`}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Botón de re-verificar */}
          {onRecheck && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRecheck}
              disabled={isChecking}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Verificar nuevamente
            </Button>
          )}
        </div>

        {/* Lista de conflictos */}
        {!available && conflicts.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium">Eventos existentes en conflicto:</p>
                <ul className="space-y-2">
                  {conflicts.map((conflict) => (
                    <li key={conflict.eventId} className="text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400">•</span>
                        <div className="flex-1">
                          <p className="font-medium">{conflict.eventName}</p>
                          <p className="text-xs text-muted-foreground">
                            {conflict.from} - {conflict.to}
                            {conflict.bufferBefore && ` (prep: ${conflict.bufferBefore} min)`}
                            {conflict.bufferAfter && ` (limpz: ${conflict.bufferAfter} min)`}
                          </p>
                          {conflict.status && (
                            <Badge variant="outline" className="mt-1">
                              {conflict.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-sm mt-3">
                  Por favor, seleccione otro horario o contacte con el equipo de Ceremonial para
                  resolver el conflicto.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Mensaje de éxito */}
        {available && (
          <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <AlertDescription className="text-green-800 dark:text-green-400">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">El horario está disponible</p>
                  <p className="text-sm mt-1">
                    Puede continuar con el envío de la solicitud. El equipo de Ceremonial revisará
                    su petición y le contactará para confirmar.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}

export default AvailabilityChecker;
