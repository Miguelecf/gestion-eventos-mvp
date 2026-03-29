import { useCallback, useEffect, useMemo, useState } from 'react';
import { auditApi } from '@/services/api/audit.api';
import type { AuditEntry } from '@/services/api/adapters';
import type { PageResponse } from '@/services/api/types/pagination.types';
import { isApprovalAuditEntry } from '@/features/events/utils/approval-helpers';

interface UseEventAuditState {
  entries: AuditEntry[];
  pageInfo: PageResponse<AuditEntry> | null;
  loading: boolean;
  error: string | null;
}

interface UseEventAuditReturn extends UseEventAuditState {
  approvalEntries: AuditEntry[];
  loadAudit: (page?: number) => Promise<void>;
  refreshAudit: () => Promise<void>;
  loadMoreAudit: () => Promise<void>;
  hasMore: boolean;
  clearError: () => void;
}

export function useEventAudit(
  eventId: number,
  options: {
    pageSize?: number;
    autoLoad?: boolean;
  } = {}
): UseEventAuditReturn {
  const {
    pageSize = 20,
    autoLoad = true,
  } = options;

  const [state, setState] = useState<UseEventAuditState>({
    entries: [],
    pageInfo: null,
    loading: false,
    error: null,
  });

  const loadAudit = useCallback(async (page: number = 0) => {
    if (!eventId) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await auditApi.getAuditHistory(eventId, {
        page,
        size: pageSize,
      });

      setState((prev) => ({
        ...prev,
        entries: page === 0 ? response.content : [...prev.entries, ...response.content],
        pageInfo: response,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar historial';

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [eventId, pageSize]);

  const refreshAudit = useCallback(async () => {
    await loadAudit(0);
  }, [loadAudit]);

  const loadMoreAudit = useCallback(async () => {
    if (!state.pageInfo || state.pageInfo.last || state.loading) {
      return;
    }

    await loadAudit(state.pageInfo.page.number + 1);
  }, [loadAudit, state.loading, state.pageInfo]);

  useEffect(() => {
    if (autoLoad) {
      loadAudit(0);
    }
  }, [autoLoad, loadAudit]);

  const approvalEntries = useMemo(
    () => state.entries.filter(isApprovalAuditEntry),
    [state.entries]
  );

  return {
    ...state,
    approvalEntries,
    loadAudit,
    refreshAudit,
    loadMoreAudit,
    hasMore: state.pageInfo ? !state.pageInfo.last : false,
    clearError: () => setState((prev) => ({ ...prev, error: null })),
  };
}
