import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AuditEntry } from '@/services/api/adapters';
import { formatAuditEntryDate } from '@/services/api/adapters';
import {
  getApprovalDecisionLabel,
  getApprovalTypeFromEntry,
  getApprovalTypeLabel,
} from '@/features/events/utils/approval-helpers';
import { EventSectionErrorState } from './EventSectionErrorState';

interface EventApprovalHistoryProps {
  entries: AuditEntry[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
}

export function EventApprovalHistory({
  entries,
  loading,
  error,
  hasMore,
  onRetry,
  onLoadMore,
}: EventApprovalHistoryProps) {
  if (error && entries.length === 0) {
    return (
      <EventSectionErrorState
        title="No se pudo cargar el historial de aprobaciones"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (loading && entries.length === 0) {
    return <p className="text-xs text-muted-foreground">Cargando historial de aprobaciones...</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No hay movimientos de conformidades registrados todavía.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <EventSectionErrorState
          title="No se pudo seguir cargando el historial de aprobaciones"
          message={error}
          onRetry={onRetry}
        />
      ) : null}

      {entries.map((entry) => {
        const approvalType = getApprovalTypeFromEntry(entry);

        if (!approvalType) {
          return null;
        }

        return (
          <div key={entry.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {getApprovalDecisionLabel(entry)}
                </Badge>
                <span className="text-sm font-medium">
                  {getApprovalTypeLabel(approvalType)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatAuditEntryDate(entry)}
              </span>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {entry.actor?.fullName || 'Sistema'}
              </p>
              <p>
                {entry.fromValue ?? 'sin valor'} → {entry.toValue ?? 'sin valor'}
              </p>
              {entry.reason ? <p>Motivo: {entry.reason}</p> : null}
              {entry.note ? <p>Nota: {entry.note}</p> : null}
            </div>
          </div>
        );
      })}

      {hasMore ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
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
