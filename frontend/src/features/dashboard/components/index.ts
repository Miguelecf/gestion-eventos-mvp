/**
 * ===================================================================
 * EXPORTS: Dashboard Components
 * ===================================================================
 * Centraliza las exportaciones de componentes del dashboard.
 * ===================================================================
 */

// Fase 1: Agenda del Día
export { TodayAgenda } from './TodayAgenda';
export { AgendaEventCard } from './AgendaEventCard';
export { EventConformityCheck } from './EventConformityCheck';
export { EventStatusBadge } from './EventStatusBadge';
export { EventTimelineBadge } from './EventTimelineBadge';
export { EmptyAgendaState } from './EmptyAgendaState';
export { AgendaSkeleton } from './AgendaSkeleton';

// Fase 2: Alertas Operativas
export { AlertsPanel } from './AlertsPanel';
export { AlertCard } from './AlertCard';

// Fase 3: Indicadores KPIs
export { KPIsGrid } from './KPIsGrid';
export { KPICard } from './KPICard';
export { TotalEventsKPI } from './TotalEventsKPI';
export { StatusDistributionKPI } from './StatusDistributionKPI';
export { ConformityPendingKPI } from './ConformityPendingKPI';
export { TechLoadKPI } from './TechLoadKPI';

// Fase 4: Filtros y Accesos Rápidos
export { AgendaFilters } from './AgendaFilters';
export { SpaceFilter } from './SpaceFilter';
export { DepartmentFilter } from './DepartmentFilter';
export { TechRequiredToggle } from './TechRequiredToggle';
export { QuickActions } from './QuickActions';
export { QuickActionButton } from './QuickActionButton';
