import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AuditEntry } from '@/services/api/adapters';
import {
  formatAuditEntryDate,
  getActionTypeLabel,
} from '@/services/api/adapters';
import { EventSectionErrorState } from './EventSectionErrorState';

interface EventAuditSectionProps {
  entries: AuditEntry[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
}

export function EventAuditSection({
  entries,
  loading,
  error,
  hasMore,
  onRetry,
  onLoadMore,
}: EventAuditSectionProps) {
  if (error && entries.length === 0) {
    return (
      <EventSectionErrorState
        title="No se pudo cargar el historial del evento"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (loading && entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Cargando historial...</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay movimientos auditados para este evento.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <EventSectionErrorState
          title="Error al cargar más historial"
          message={error}
          onRetry={onRetry}
        />
      ) : null}

      {entries.map((entry) => (
        <div key={entry.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{getActionTypeLabel(entry.actionType)}</Badge>
              {entry.field ? (
                <Badge variant="outline">{entry.field}</Badge>
              ) : null}
            </div>

            <span className="text-xs text-muted-foreground">
              {formatAuditEntryDate(entry)}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">{entry.actor?.fullName || 'Sistema'}</p>
            <p className="text-sm text-muted-foreground">{entry.description}</p>
            {entry.fromValue !== null || entry.toValue !== null ? (
              <p className="text-xs text-muted-foreground">
                {entry.fromValue ?? 'sin valor'} → {entry.toValue ?? 'sin valor'}
              </p>
            ) : null}
            {entry.reason ? (
              <p className="text-xs text-muted-foreground">Motivo: {entry.reason}</p>
            ) : null}
            {entry.note ? (
              <p className="text-xs text-muted-foreground">Nota: {entry.note}</p>
            ) : null}
            {entry.details && !entry.reason && !entry.note ? (
              <p className="text-xs text-muted-foreground break-words">{entry.details}</p>
            ) : null}
          </div>
        </div>
      ))}

      {hasMore ? (
        <Button
          type="button"
          variant="outline"
          onClick={onLoadMore}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Cargando...' : 'Cargar más historial'}
        </Button>
      ) : null}
    </div>
  );
}
