/**
 * ===================================================================
 * HOOK: useTechCapacityStatus
 * ===================================================================
 * Consulta el endpoint /internal/tech/capacity para verificar
 * si hay saturación de capacidad técnica en los bloques horarios
 * del evento
 * ===================================================================
 */

import { useEffect, useState } from 'react';
import { httpClient } from '@/services/api/client';

interface TechCapacityBlock {
  from: string;    // HH:mm
  to: string;      // HH:mm
  used: number;
  available: number;
}

interface TechCapacityResponse {
  date: string;
  blockMinutes: number;
  defaultSlots: number;
  blocks: TechCapacityBlock[];
}

interface UseTechCapacityStatusReturn {
  /** Si hay saturación en los bloques del evento */
  isSaturated: boolean;
  /** Si está cargando la información */
  loading: boolean;
  /** Error si falló la carga (null si no hay error) */
  error: string | null;
  /** Bloques saturados (available === 0) */
  saturatedBlocks: TechCapacityBlock[];
}

/**
 * Hook para verificar estado de capacidad técnica en una fecha/hora específica
 * 
 * COMPORTAMIENTO:
 * - Si el usuario no tiene permisos (401/403): falla silenciosamente (isSaturated = false)
 * - Si hay error de red: falla silenciosamente
 * - Solo muestra datos si el endpoint responde exitosamente
 * 
 * @param date - Fecha del evento (yyyy-MM-dd)
 * @param scheduleFrom - Hora de inicio (HH:mm)
 * @param scheduleTo - Hora de fin (HH:mm)
 * @param enabled - Si el hook debe ejecutarse (default: true)
 * 
 * @example
 * const { isSaturated, saturatedBlocks } = useTechCapacityStatus(
 *   '2025-12-15',
 *   '09:00',
 *   '11:00'
 * );
 * 
 * if (isSaturated) {
 *   console.log('Capacidad técnica colmada en:', saturatedBlocks);
 * }
 */
export function useTechCapacityStatus(
  date: string | null,
  scheduleFrom: string | null,
  scheduleTo: string | null,
  enabled: boolean = true
): UseTechCapacityStatusReturn {
  const [isSaturated, setIsSaturated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saturatedBlocks, setSaturatedBlocks] = useState<TechCapacityBlock[]>([]);

  useEffect(() => {
    // No ejecutar si no está habilitado o faltan datos
    if (!enabled || !date || !scheduleFrom || !scheduleTo) {
      setIsSaturated(false);
      setSaturatedBlocks([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchCapacity = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await httpClient.get<TechCapacityResponse>(
          `/internal/tech/capacity?date=${date}`
        );

        if (cancelled) return;

        // Parsear horas de inicio y fin del evento
        const [startHour, startMinute] = scheduleFrom.split(':').map(Number);
        const [endHour, endMinute] = scheduleTo.split(':').map(Number);

        const eventStartMinutes = startHour * 60 + startMinute;
        const eventEndMinutes = endHour * 60 + endMinute;

        // Filtrar bloques que se solapan con el horario del evento
        const relevantBlocks = response.blocks.filter((block) => {
          const [blockHour, blockMinute] = block.from.split(':').map(Number);
          const blockStartMinutes = blockHour * 60 + blockMinute;

          // El bloque se solapa si empieza durante el evento
          return (
            blockStartMinutes >= eventStartMinutes &&
            blockStartMinutes < eventEndMinutes
          );
        });

        // Filtrar bloques saturados (available === 0)
        const saturated = relevantBlocks.filter((block) => block.available === 0);

        setIsSaturated(saturated.length > 0);
        setSaturatedBlocks(saturated);
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;

        // ✅ Degradación silenciosa: no mostrar error si es de permisos
        if (err.status === 401 || err.status === 403) {
          console.warn('[TechCapacity] Usuario sin permisos, omitiendo indicador');
        } else {
          console.error('[TechCapacity] Error al cargar capacidad técnica:', err);
          setError(err.message || 'Error al cargar capacidad técnica');
        }

        setIsSaturated(false);
        setSaturatedBlocks([]);
        setLoading(false);
      }
    };

    fetchCapacity();

    return () => {
      cancelled = true;
    };
  }, [date, scheduleFrom, scheduleTo, enabled]);

  return {
    isSaturated,
    loading,
    error,
    saturatedBlocks,
  };
}
