import { httpClient } from "./client";
import { ENDPOINTS } from "./client/config";
import { adaptSpringPage } from "./adapters/pagination.adapter";
import type {
  AvailabilityCheckRequest,
  AvailabilityCheckResponse,
  EventRequestCreatedResponse,
  EventRequestStatusResponse,
  EventStatus,
  PublicEventRequestPayload,
  PublicSpaceListItem,
  SpaceOccupancyResponse,
} from "./types/backend.types";
import type { PageResponse, SpringPageResponse } from "./types/pagination.types";
import {
  matchesRequestSearch,
  type PublicEventRequest,
  type PublicRequestStatus,
  type PublicRequestsQueryParams,
} from "@/models/public-request";
import type { Department } from "@/models/department";
import type { Space } from "@/models/space";

export interface PublicSpacesFilters {
  publishableOnly?: boolean;
}

export interface ChangeAdminRequestStatusInput {
  newStatus: Extract<PublicRequestStatus, "EN_REVISION" | "RECHAZADO">;
  reason?: string;
}

export interface RequestConversionResult {
  eventId: number;
  eventName: string;
  eventStatus: EventStatus;
}

interface BackendEventRequestResponseDto {
  id: number;
  trackingUuid: string;
  date: string;
  technicalSchedule: string | null;
  scheduleFrom: string;
  scheduleTo: string;
  status: PublicRequestStatus;
  name: string;
  space: {
    id: number;
    name: string;
    capacity: number | null;
    colorHex: string | null;
  } | null;
  freeLocation: string | null;
  requestingDepartment: {
    id: number;
    name: string;
    colorHex: string | null;
  } | null;
  requirements: string | null;
  coverage: string | null;
  observations: string | null;
  priority: PublicEventRequest["priority"];
  audienceType: PublicEventRequest["audienceType"];
  bufferBeforeMin: number | null;
  bufferAfterMin: number | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  requestDate: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  convertedAt: string | null;
  convertedBy: string | null;
  convertedEventId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BackendConvertedEventResponseDto {
  id: number;
  status: EventStatus;
  name: string;
}

function adaptSpace(space: BackendEventRequestResponseDto["space"]): Space | null {
  if (!space) {
    return null;
  }

  return {
    id: space.id,
    name: space.name,
    capacity: space.capacity ?? 0,
    colorHex: space.colorHex || "#6B7280",
    defaultBufferBeforeMin: 0,
    defaultBufferAfterMin: 0,
    active: true,
  };
}

function adaptDepartment(
  department: BackendEventRequestResponseDto["requestingDepartment"]
): Department | null {
  if (!department) {
    return null;
  }

  return {
    id: department.id,
    name: department.name,
    colorHex: department.colorHex || "#6B7280",
    active: true,
  };
}

function adaptRequestFromBackend(
  dto: BackendEventRequestResponseDto
): PublicEventRequest {
  return {
    id: dto.id,
    trackingUuid: dto.trackingUuid,
    date: dto.date,
    technicalSchedule: dto.technicalSchedule,
    scheduleFrom: dto.scheduleFrom,
    scheduleTo: dto.scheduleTo,
    status: dto.status,
    name: dto.name,
    space: adaptSpace(dto.space),
    freeLocation: dto.freeLocation,
    requestingDepartment: adaptDepartment(dto.requestingDepartment),
    requirements: dto.requirements,
    coverage: dto.coverage,
    observations: dto.observations,
    priority: dto.priority,
    audienceType: dto.audienceType,
    bufferBeforeMin: dto.bufferBeforeMin ?? 0,
    bufferAfterMin: dto.bufferAfterMin ?? 0,
    contactName: dto.contactName,
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone,
    requestDate: dto.requestDate,
    reviewedAt: dto.reviewedAt,
    reviewedBy: dto.reviewedBy,
    convertedAt: dto.convertedAt,
    convertedBy: dto.convertedBy,
    convertedEventId: dto.convertedEventId,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function getSortableValue(request: PublicEventRequest, field: string): string | number {
  switch (field) {
    case "name":
      return request.name.toLowerCase();
    case "date":
      return request.date;
    case "scheduleFrom":
      return request.scheduleFrom;
    case "scheduleTo":
      return request.scheduleTo;
    case "requestDate":
    default:
      return request.requestDate;
  }
}

function sortRequests(
  requests: PublicEventRequest[],
  sort = "requestDate,desc"
): PublicEventRequest[] {
  const [field = "requestDate", direction = "desc"] = sort.split(",");
  const multiplier = direction.toLowerCase() === "asc" ? 1 : -1;

  return [...requests].sort((left, right) => {
    const leftValue = getSortableValue(left, field);
    const rightValue = getSortableValue(right, field);

    if (leftValue < rightValue) {
      return -1 * multiplier;
    }
    if (leftValue > rightValue) {
      return 1 * multiplier;
    }
    return 0;
  });
}

function adaptLocalPage(
  items: PublicEventRequest[],
  page: number,
  size: number
): PageResponse<PublicEventRequest> {
  const totalElements = items.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
  const startIndex = page * size;
  const content = items.slice(startIndex, startIndex + size);

  return {
    content,
    page: {
      number: page,
      size,
      totalElements,
      totalPages,
    },
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
    empty: totalElements === 0,
  };
}

function normalizeRequestCollection(
  data: BackendEventRequestResponseDto[] | SpringPageResponse<BackendEventRequestResponseDto>
): BackendEventRequestResponseDto[] {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.content) ? data.content : [];
}

export async function listAdminRequests(
  params: PublicRequestsQueryParams = {}
): Promise<PageResponse<PublicEventRequest>> {
  const page = params.page ?? 0;
  const size = params.size ?? 20;
  const sort = params.sort ?? "requestDate,desc";
  const search = params.search?.trim();

  // Technical debt:
  // Until the backend exposes GET /admin/event-requests, the admin listing still
  // depends on /public/event-requests and therefore only includes active requests.
  if (search) {
    const backendRequests = await httpClient.get<
      BackendEventRequestResponseDto[] | SpringPageResponse<BackendEventRequestResponseDto>
    >(
      ENDPOINTS.PUBLIC_EVENT_REQUESTS
    );

    const filteredRequests = sortRequests(
      normalizeRequestCollection(backendRequests)
        .map(adaptRequestFromBackend)
        .filter((request) => matchesRequestSearch(request, search)),
      sort
    );

    return adaptLocalPage(filteredRequests, page, size);
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort,
  });

  const data = await httpClient.get<SpringPageResponse<BackendEventRequestResponseDto>>(
    `${ENDPOINTS.PUBLIC_EVENT_REQUESTS}?${queryParams.toString()}`
  );

  return adaptSpringPage(data, adaptRequestFromBackend);
}

export async function getAdminRequestById(id: number): Promise<PublicEventRequest> {
  const request = await httpClient.get<BackendEventRequestResponseDto>(
    ENDPOINTS.ADMIN_EVENT_REQUEST_BY_ID(id)
  );

  return adaptRequestFromBackend(request);
}

export async function changeAdminRequestStatus(
  id: number,
  payload: ChangeAdminRequestStatusInput
): Promise<PublicEventRequest> {
  const request = await httpClient.patch<BackendEventRequestResponseDto>(
    ENDPOINTS.ADMIN_EVENT_REQUEST_STATUS(id),
    payload
  );

  return adaptRequestFromBackend(request);
}

export async function convertAdminRequestToEvent(
  id: number
): Promise<RequestConversionResult> {
  const event = await httpClient.post<BackendConvertedEventResponseDto>(
    ENDPOINTS.ADMIN_EVENT_REQUEST_CONVERT(id)
  );

  return {
    eventId: event.id,
    eventName: event.name,
    eventStatus: event.status,
  };
}

export const getPublicRequests = listAdminRequests;
export const getPublicRequestById = getAdminRequestById;

export async function createPublicEventRequest(
  payload: PublicEventRequestPayload
): Promise<EventRequestCreatedResponse> {
  return await httpClient.post<EventRequestCreatedResponse>(
    ENDPOINTS.PUBLIC_EVENT_REQUESTS,
    payload
  );
}

export async function trackPublicEventRequest(
  trackingUuid: string
): Promise<EventRequestStatusResponse> {
  return await httpClient.get<EventRequestStatusResponse>(
    ENDPOINTS.PUBLIC_TRACK(trackingUuid)
  );
}

export async function checkPublicAvailability(
  checkRequest: AvailabilityCheckRequest
): Promise<AvailabilityCheckResponse> {
  return await httpClient.post<AvailabilityCheckResponse>(
    ENDPOINTS.AVAILABILITY_PUBLIC_CHECK,
    checkRequest
  );
}

export async function getPublicSpaces(
  filters?: PublicSpacesFilters
): Promise<PublicSpaceListItem[]> {
  const params = new URLSearchParams();

  if (filters?.publishableOnly !== false) {
    params.append("publishableOnly", "true");
  }

  return await httpClient.get<PublicSpaceListItem[]>(
    `${ENDPOINTS.CATALOG_SPACES_PUBLIC}${params.toString() ? `?${params.toString()}` : ""}`
  );
}

export async function getSpaceMonthlyOccupancy(
  spaceId: number,
  year: number,
  month: number
): Promise<SpaceOccupancyResponse> {
  return await httpClient.get<SpaceOccupancyResponse>(
    ENDPOINTS.PUBLIC_SPACE_OCCUPANCY(spaceId),
    {
      params: { year, month },
    }
  );
}

export const publicRequestsApi = {
  listAdminRequests,
  getAdminRequestById,
  changeAdminRequestStatus,
  convertAdminRequestToEvent,
  getPublicRequests,
  getPublicRequestById,
  createPublicEventRequest,
  trackPublicEventRequest,
  checkPublicAvailability,
  getPublicSpaces,
  getSpaceMonthlyOccupancy,
};

export default publicRequestsApi;
