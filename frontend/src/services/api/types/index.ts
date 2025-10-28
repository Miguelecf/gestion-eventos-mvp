/**
 * Barrel export para tipos de API
 * Facilita imports: import { ApiError, PageResponse } from '@/services/api/types'
 */

// API Types
export type {
  ApiError,
  ApiResponse,
  NoContentResponse,
  OperationResult,
  CreatedResponse,
  UpdatedResponse,
  DeletedResponse
} from './api.types';

// Pagination Types
export type {
  PaginationParams,
  SortParam,
  PageResponse,
  SpringPageResponse,
  CustomPageResponse,
  AnyPageResponse
} from './pagination.types';

// Backend DTOs y Enums
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
} from './backend.types';

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
} from './backend.types';
