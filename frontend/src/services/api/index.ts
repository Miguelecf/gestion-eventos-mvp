/**
 * ===================================================================
 * API SERVICE - BARREL EXPORT
 * ===================================================================
 * Import principal para toda la capa de servicios API
 * 
 * Uso:
 * import { httpClient, ENDPOINTS, toBackendDate, EventStatus } from '@/services/api'
 * ===================================================================
 */

// Cliente HTTP
export { httpClient } from './client/httpClient';
export { API_CONFIG, ENDPOINTS, ERROR_CODES } from './client/config';
export type { ErrorCode } from './client/config';

// Tipos
export type {
  ApiError,
  ApiResponse,
  NoContentResponse,
  OperationResult,
  PaginationParams,
  SortParam,
  PageResponse,
  SpringPageResponse,
  CustomPageResponse
} from './types';

// Enums del Backend
export {
  EventStatus,
  Priority,
  TechSupportMode,
  AudienceType,
  UserRole,
  CommentVisibility,
  AuditActionType,
  PublicRequestStatus,
  PriorityConflictStatus,
  ConflictDecision
} from './types';

// DTOs del Backend
export type {
  BackendEventDTO,
  BackendCreateEventDTO,
  BackendUpdateEventDTO,
  BackendStatusChangeResponse,
  BackendCommentDTO,
  BackendCommentsPage,
  BackendCreateCommentDTO,
  BackendUpdateCommentDTO,
  BackendAuditEntryDTO,
  BackendAuditPage,
  BackendSpaceDTO,
  BackendDepartmentDTO,
  BackendSpaceAvailabilityResponse,
  BackendTechnicalCapacityResponse,
  BackendPriorityConflictsResponse,
  BackendPriorityDecisionDTO,
  BackendPriorityDecisionResult,
  BackendSubmitPublicRequestDTO,
  BackendSubmitPublicRequestResponse,
  BackendPublicTrackingResponse,
  BackendMeDTO
} from './types';

// Adaptadores
export {
  // Date adapters
  toBackendDate,
  fromBackendDate,
  fromBackendTime,
  toBackendTime,
  fromBackendTimestamp,
  toBackendTimestamp,
  formatDisplayDate,
  formatDisplayTime,
  formatDisplayTimestamp,
  combineDateAndTime,
  isNotPastDate,
  isDateInRange,
  
  // Pagination adapters
  adaptSpringPage,
  adaptCustomPage,
  buildPaginationQuery,
  buildSortParam,
  buildSortParams,
  calculateOffset,
  calculatePage,
  hasNextPage,
  hasPreviousPage,
  createEmptyPage
} from './adapters';

// ==================== FASE 3: SDKs DE DOMINIO ====================

// SDK de Eventos
export { eventsApi } from './events.api';
export type {
  EventsQueryParams,
  CreateEventInput,
  UpdateEventInput,
  ChangeStatusInput,
  AvailabilityCheckParams,
  CalendarEventsParams,
  EventStatsParams,
  ExportEventsParams
} from './events.api';

// SDK de Comentarios
export { commentsApi } from './comments.api';
export type {
  GetCommentsParams,
  CreateCommentInput,
  UpdateCommentInput,
  QuickReaction
} from './comments.api';

// SDK de Auditoría
export { auditApi } from './audit.api';
export type {
  GetAuditHistoryParams,
  AuditSummary,
  AuditTimeline
} from './audit.api';

// SDK de Disponibilidad y Capacidad Técnica
export { availabilityApi } from './availability.api';
export type {
  CheckAvailabilityParams,
  AvailabilityConflict,
  AvailabilityResult,
  TechCapacityBlock,
  TechCapacityResult,
  TechSupportEvent,
  GetTechEventsParams,
  GetSpaceOccupancyParams,
  OccupancySlot,
  SpaceOccupancyResult
} from './availability.api';

// SDK de Conflictos, Prioridad y Catálogos
export { catalogsApi } from './catalogs.api';
export type {
  PriorityConflict,
  ConflictsResult,
  GetConflictsParams,
  MakeDecisionParams,
  DecisionResult,
  Space,
  Department,
  PublicEventRequestInput,
  PublicRequestResult,
  PublicTrackingResult
} from './catalogs.api';

// ==================== FASE 4: UTILIDADES ====================

// Query Builder
export {
  QueryBuilder,
  createQueryBuilder,
  buildPaginationQuery as buildPaginationQueryUtil,
  buildPaginationWithSortQuery,
  buildDateRangeQuery,
  buildSearchQuery,
  parseQueryString,
  mergeQueryStrings,
  removeQueryParams,
  updateQueryParam
} from './utils';

export type {
  PaginationOptions,
  SortOptions,
  FilterValue,
  DateRangeOptions,
  SearchOptions
} from './utils';

// Validation Schemas (Zod)
export {
  ValidationSchemas,
  EventTypeSchema,
  EventStatusSchema,
  PublicRequestStatusSchema,
  emailSchema,
  phoneSchema,
  dateStringSchema,
  dateRangeSchema,
  createEventSchema,
  updateEventSchema,
  changeEventStatusSchema,
  createCommentSchema,
  updateCommentSchema,
  quickReactionSchema,
  checkAvailabilitySchema,
  findAvailableSlotSchema,
  submitPublicRequestSchema,
  trackPublicRequestSchema,
  conflictDecisionSchema,
  resolveMultipleConflictsSchema,
  paginationSchema,
  sortSchema,
  eventFiltersSchema,
  commentFiltersSchema,
  auditFiltersSchema
} from './utils';

// Validators
export {
  validateWithSchema,
  validateOrThrow,
  formatZodErrors,
  getFieldError,
  groupErrorsByField,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidISODate,
  isValidDateRange,
  isNotPastDate as isNotPastDateValidator,
  isDateInRange as isDateInRangeValidator,
  hasValidLength,
  isPositiveNumber,
  isInteger,
  isNonEmptyArray,
  isNonEmptyObject,
  sanitizeString,
  normalizeEmail,
  normalizePhone,
  escapeHtml,
  sanitizeInput,
  hasValidExtension,
  hasValidFileSize,
  hasValidMimeType,
  validateEventForm,
  validateComment,
  validatePublicRequest
} from './utils';

export type {
  ValidationResult,
  ValidationError
} from './utils';

// Error Handler
export {
  isAxiosError,
  isValidationError,
  isNetworkError,
  isAuthError,
  isNotFoundError,
  isConflictError,
  isServerError,
  classifyError,
  handleApiError,
  extractErrorMessage,
  formatErrorMessage,
  getUserFriendlyMessage,
  formatValidationErrors,
  formatErrorList,
  logError,
  logCriticalError,
  retryWithBackoff,
  safeAsync,
  createApiError
} from './utils';

export type {
  ApiErrorType,
  ApiError as ApiErrorUtil,
  ErrorFormatOptions
} from './utils';
